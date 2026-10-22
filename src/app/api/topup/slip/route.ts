import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { verifySlip } from "@/lib/slip";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendDiscordNotification } from "@/lib/discord";

const MAX_SLIP_BASE64_LENGTH = 7 * 1024 * 1024; // ~5MB image limit

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`slip_${ip}`, 6, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณทำรายการตรวจสอบสลิปถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
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

    const userRateCheck = checkRateLimit(`slip_user_${user.id}`, 5, 60 * 1000);
    if (!userRateCheck.success) {
      return NextResponse.json(
        { error: `คุณส่งสลิปถี่เกินไป กรุณารออีก ${userRateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const slipImage = body?.slipImage;
    const expectedAmount =
      body?.amount !== undefined && body?.amount !== ""
        ? Number(body.amount)
        : undefined;

    if (!slipImage || typeof slipImage !== "string") {
      return NextResponse.json(
        { error: "กรุณาแนบรูปภาพสลิปการโอนเงิน" },
        { status: 400 }
      );
    }

    if (slipImage.length > MAX_SLIP_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "ไฟล์รูปภาพสลิปมีขนาดใหญ่เกินไป (จำกัดไม่เกิน 5MB)" },
        { status: 413 }
      );
    }

    // 1. Verify slip with provider
    const verification = await verifySlip(slipImage, expectedAmount);

    if (
      !verification.success ||
      !Number.isFinite(verification.amount) ||
      verification.amount <= 0 ||
      !verification.transRef
    ) {
      return NextResponse.json(
        { error: verification.message || "สลิปไม่ถูกต้อง หรือไม่สามารถยืนยันยอดเงินได้" },
        { status: 400 }
      );
    }

    // 2. Check duplicate transRef before transaction
    const existingSlip = await prisma.topupTransaction.findUnique({
      where: { transRef: verification.transRef },
    });

    if (existingSlip) {
      return NextResponse.json(
        { error: "สลิปนี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้" },
        { status: 409 }
      );
    }

    // 3. Credit user in atomic transaction (transRef has @unique in DB to block race conditions)
    const transId = `TOP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const [updatedUser, topupRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: verification.amount },
        },
        select: {
          id: true,
          username: true,
          balance: true,
        },
      }),
      prisma.topupTransaction.create({
        data: {
          transactionId: transId,
          userId: user.id,
          type: "SLIP",
          amount: verification.amount,
          transRef: verification.transRef,
          senderName: verification.senderName || "ผู้โอน",
          bank: verification.bank || "พร้อมเพย์",
          status: "SUCCESS",
          rawPayload: JSON.stringify(verification.raw || {}),
        },
        select: {
          id: true,
          transactionId: true,
          type: true,
          amount: true,
          transRef: true,
          senderName: true,
          bank: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    sendDiscordNotification({
      title: "💳 เติมเงินสำเร็จ (PromptPay Slip)",
      description: `ผู้ใช้ **${user.username}** เติมเงินผ่านสลิปธนาคารสำเร็จ`,
      color: 0x10b981,
      fields: [
        { name: "จำนวนเงิน", value: `฿${verification.amount.toFixed(2)}`, inline: true },
        { name: "ผู้โอน", value: verification.senderName || "ผู้โอน", inline: true },
        { name: "อ้างอิง", value: verification.transRef, inline: false },
      ],
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `เติมเงินสำเร็จจำนวน ฿${verification.amount.toFixed(2)} ยอดเงินเข้ากระเป๋าเรียบร้อยแล้ว`,
      newBalance: updatedUser.balance,
      transaction: topupRecord,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "สลิปนี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้" },
        { status: 409 }
      );
    }
    console.error("[Slip Topup Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
