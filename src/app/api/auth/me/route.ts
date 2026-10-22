import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  try {
    const ip = getClientIp(req);
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`pwd_change_${user.id}_${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณพยายามเปลี่ยนรหัสผ่านถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!newPassword || newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่ต้องมีความยาวระหว่าง 6 ถึง 128 ตัวอักษร" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "ไม่พบบัญชีผู้ใช้" }, { status: 404 });
    }

    if (dbUser.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันตัวตน" },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err: unknown) {
    console.error("[Change Password Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" },
      { status: 500 }
    );
  }
}
