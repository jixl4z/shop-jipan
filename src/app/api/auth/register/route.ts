import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณทำรายการสมัครสมาชิกถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawUsername = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const cfToken = body?.cfToken;

    // Verify Cloudflare Turnstile token with client IP
    const cfCheck = await verifyTurnstileToken(cfToken, ip);
    if (!cfCheck.success) {
      return NextResponse.json(
        { error: cfCheck.message || "การยืนยันตัวตนความปลอดภัย Cloudflare ล้มเหลว" },
        { status: 403 }
      );
    }

    if (!rawUsername || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(rawUsername)) {
      return NextResponse.json(
        {
          error:
            "ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ ความยาว 3-24 ตัวอักษร (ห้ามเว้นวรรคหรือใช้อักขระพิเศษ)",
        },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีความยาวระหว่าง 6 ถึง 128 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (rawEmail && (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 100)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Check existing username or email
    const existing = await prisma.user.findFirst({
      where: rawEmail
        ? { OR: [{ username: rawUsername }, { email: rawEmail }] }
        : { username: rawUsername },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.username === rawUsername
              ? "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
              : "อีเมลนี้ถูกใช้งานในระบบแล้ว",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: rawUsername,
        email: rawEmail || null,
        password: hashedPassword,
        role: "USER",
        balance: 0.0,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        balance: true,
      },
    });

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      user,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("[Register API Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
