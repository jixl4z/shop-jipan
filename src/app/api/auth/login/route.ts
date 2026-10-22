import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`login_${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณพยายามเข้าสู่ระบบถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const cfToken = body?.cfToken;

    if (!username || !password || username.length > 64 || password.length > 128) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ถูกต้อง" },
        { status: 400 }
      );
    }

    // Per-account rate limit to prevent distributed brute-force attacks
    const accountRate = checkRateLimit(`login_acct_${username.toLowerCase()}`, 8, 60 * 1000);
    if (!accountRate.success) {
      return NextResponse.json(
        { error: `บัญชีนี้ถูกพยายามเข้าสู่ระบบหลายครั้ง กรุณารออีก ${accountRate.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    // Verify Cloudflare Turnstile token
    const cfCheck = await verifyTurnstileToken(cfToken, ip);
    if (!cfCheck.success) {
      return NextResponse.json(
        { error: cfCheck.message || "การยืนยันตัวตนความปลอดภัย Cloudflare ล้มเหลว" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "บัญชีนี้เชื่อมต่อผ่าน Discord หรือ Google กรุณาเข้าสู่ระบบผ่านปุ่มโซเชียลด้านล่าง" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      balance: user.balance,
    };

    const response = NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: safeUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("[Login API Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
