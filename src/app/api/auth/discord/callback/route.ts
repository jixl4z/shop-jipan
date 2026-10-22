import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME, OAUTH_STATE_COOKIE, getSafeBaseUrl } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const baseUrl = getSafeBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=discord_canceled", baseUrl));
  }

  // Verify OAuth state parameter to prevent Login CSRF
  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" + encodeURIComponent("เซสชันยืนยันตัวตนหมดอายุหรือไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"),
        baseUrl
      )
    );
  }

  try {
    const setting = await prisma.shopSetting.findUnique({ where: { id: "default" } });
    const clientId = setting?.discordClientId || process.env.DISCORD_CLIENT_ID;
    const clientSecret = setting?.discordClientSecret || process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("ขาดการตั้งค่า Discord Client Secret"), baseUrl)
      );
    }

    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Discord Token Exchange Failed:", tokenData);
      return NextResponse.redirect(new URL("/login?error=discord_token_failed", baseUrl));
    }

    // 2. Fetch Discord user profile
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userRes.json();
    if (!userRes.ok || !discordUser.id) {
      return NextResponse.redirect(new URL("/login?error=discord_user_failed", baseUrl));
    }

    const discordId = String(discordUser.id);
    const isEmailVerified = discordUser.verified === true && Boolean(discordUser.email);
    const verifiedEmail = isEmailVerified ? String(discordUser.email).toLowerCase() : null;
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // 3. Find user by discordId first
    let user = await prisma.user.findUnique({
      where: { discordId },
    });

    // Only auto-link by email if the Discord email is verified AND target account is NOT an ADMIN
    if (!user && verifiedEmail) {
      const emailUser = await prisma.user.findUnique({
        where: { email: verifiedEmail },
      });
      if (emailUser && emailUser.role !== "ADMIN") {
        user = emailUser;
      }
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId,
          avatar: avatar || user.avatar,
        },
      });
    } else {
      let uniqueUsername = String(discordUser.username || "")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 20);
      if (uniqueUsername.length < 3) uniqueUsername = `discord_${discordId.slice(-6)}`;

      const existingName = await prisma.user.findUnique({ where: { username: uniqueUsername } });
      if (existingName) {
        uniqueUsername = `${uniqueUsername.slice(0, 16)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email: verifiedEmail || `discord_${discordId}@discord.user`,
          discordId,
          avatar,
          role: "USER",
          balance: 0.0,
        },
      });
    }

    // 4. Generate JWT & Set Cookie
    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.redirect(new URL("/", baseUrl));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    console.error("Discord OAuth Error:", err);
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("เกิดข้อผิดพลาดในการเชื่อมต่อ Discord"), baseUrl)
    );
  }
}
