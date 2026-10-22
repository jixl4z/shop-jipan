import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { redeemTrueMoneyVoucher, extractVoucherCode } from "@/lib/truemoney";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`truemoney_${ip}`, 6, 60 * 1000);
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

    const userRateCheck = checkRateLimit(`truemoney_user_${user.id}`, 5, 60 * 1000);
    if (!userRateCheck.success) {
      return NextResponse.json(
        { error: `คุณส่งลิงก์ซองของขวัญถี่เกินไป กรุณารอสักครู่` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const voucherLink = body?.voucherLink;

    if (
      !voucherLink ||
      typeof voucherLink !== "string" ||
      !voucherLink.trim() ||
      voucherLink.length > 300
    ) {
      return NextResponse.json(
        { error: "กรุณาระบุลิงก์ซองของขวัญ TrueMoney Wallet ให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const voucherCode = extractVoucherCode(voucherLink);
    if (!voucherCode || voucherCode.length < 8 || voucherCode.length > 64) {
      return NextResponse.json(
        { error: "รูปแบบลิงก์ซองของขวัญไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Check duplicate voucher in database
    const existing = await prisma.topupTransaction.findUnique({
      where: { transRef: voucherCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ซองของขวัญนี้ถูกใช้งานในระบบไปแล้ว ไม่สามารถใช้ซ้ำได้" },
        { status: 409 }
      );
    }

    // Get merchant TrueMoney receiver phone from settings
    const setting = await prisma.shopSetting.findUnique({
      where: { id: "default" },
    });

    const merchantPhone = setting?.truemoneyNumber || setting?.promptPayNumber || "";
    if (!merchantPhone || merchantPhone.length < 10) {
      return NextResponse.json(
        {
          error:
            "ร้านค้ายังไม่ได้ตั้งค่าเบอร์โทรศัพท์สำหรับรับซอง TrueMoney Wallet ในระบบหลังบ้าน กรุณาติดต่อแอดมิน",
        },
        { status: 400 }
      );
    }

    // Redeem voucher via TrueMoney API
    const result = await redeemTrueMoneyVoucher(voucherCode, merchantPhone);

    if (!result.success || !Number.isFinite(result.amount) || result.amount <= 0) {
      return NextResponse.json(
        { error: result.message || "ไม่สามารถรับเงินจากซองของขวัญได้" },
        { status: 400 }
      );
    }

    // Credit user balance in atomic transaction
    const transId = `TW-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 900 + 100
    )}`;

    const [updatedUser, topupRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: result.amount },
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
          type: "TRUEMONEY",
          amount: result.amount,
          transRef: voucherCode,
          senderName: result.ownerName || "ซองของขวัญ",
          bank: "TrueMoney Wallet",
          status: "SUCCESS",
          rawPayload: JSON.stringify(result.raw || {}),
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
      title: "🧧 เติมเงินสำเร็จ (ซองของขวัญ TrueMoney)",
      description: `ผู้ใช้ **${user.username}** เติมเงินผ่านซองอั่งเปาสำเร็จ`,
      color: 0xf59e0b,
      fields: [
        { name: "จำนวนเงิน", value: `฿${result.amount.toFixed(2)}`, inline: true },
        { name: "ผู้สร้างซอง", value: result.ownerName || "ลูกค้า", inline: true },
      ],
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `รับเงินจากซอง TrueMoney สำเร็จ ฿${result.amount.toFixed(
        2
      )} ยอดเงินเข้ากระเป๋าเรียบร้อยแล้ว`,
      amount: result.amount,
      newBalance: updatedUser.balance,
      transaction: topupRecord,
    });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "ซองของขวัญนี้ถูกใช้งานในระบบไปแล้ว ไม่สามารถใช้ซ้ำได้" },
        { status: 409 }
      );
    }
    console.error("[TrueMoney Topup Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบซองของขวัญ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
