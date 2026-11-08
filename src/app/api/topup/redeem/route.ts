import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`redeem_${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณทำรายการถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการเติมเงิน" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัส Redeem Code ให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.trim().toUpperCase();

    // Check if code was already redeemed by this user or global transaction
    const existingTx = await prisma.topupTransaction.findFirst({
      where: {
        transRef: `REDEEM_${cleanCode}`,
        status: "SUCCESS",
      },
    });

    if (existingTx) {
      return NextResponse.json(
        { error: "รหัส Redeem Code นี้ถูกใช้งานไปแล้ว" },
        { status: 400 }
      );
    }

    // 1. Check coupon table for matching code
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    let redeemAmount = 50; // default test amount

    if (coupon) {
      if (!coupon.isActive) {
        return NextResponse.json(
          { error: "โค้ดนี้ถูกปิดการใช้งานแล้ว" },
          { status: 400 }
        );
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "โค้ดนี้หมดอายุแล้ว" },
          { status: 400 }
        );
      }
      redeemAmount = coupon.discountValue || 50;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});
    } else {
      // Allow popular demo formats or pattern GIFT-XX, PROMOXX
      const numberMatch = cleanCode.match(/\d+/);
      if (numberMatch) {
        const parsed = parseInt(numberMatch[0]);
        if (parsed > 0 && parsed <= 1000) {
          redeemAmount = parsed;
        }
      }
    }

    // Increment user balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: redeemAmount },
      },
      select: { balance: true },
    });

    // Record transaction
    const tx = await prisma.topupTransaction.create({
      data: {
        transactionId: `TX-RED-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
        userId: user.id,
        type: "REDEEM",
        amount: redeemAmount,
        transRef: `REDEEM_${cleanCode}`,
        senderName: cleanCode,
        status: "SUCCESS",
      },
    });

    try {
      await sendDiscordNotification({
        title: "🎁 มีการแลกรับ Redeem Code สำเร็จ!",
        description: `ผู้ใช้ **${user.username}** แลกโค้ด \`${cleanCode}\``,
        color: 0xf59e0b,
        fields: [
          { name: "ผู้ใช้", value: user.username, inline: true },
          { name: "ยอดเงินที่ได้รับ", value: `฿${redeemAmount.toFixed(2)}`, inline: true },
          { name: "ยอดคงเหลือใหม่", value: `฿${updatedUser.balance.toFixed(2)}`, inline: true },
        ],
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `แลกรับโค้ดสำเร็จ! ได้รับเงินจำนวน ฿${redeemAmount.toFixed(2)} เข้ากระเป๋าเรียบร้อยแล้ว`,
      amount: redeemAmount,
      newBalance: updatedUser.balance,
      transactionId: tx.transactionId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการแลกรับโค้ด" }, { status: 500 });
  }
}
