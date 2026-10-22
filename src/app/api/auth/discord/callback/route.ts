import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME, OAUTH_STATE_COOKIE, getSafeBaseUrl, ensureSocialAuthColumns } from "@/lib/auth";

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
    await ensureSocialAuthColumns();

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
      const detail = tokenData?.error_description || tokenData?.error || "Token exchange failed";
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent(`Discord Token Error: ${detail}`), baseUrl)
      );
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
    let user = await prisma.user.findFirst({
      where: { discordId },
    });

    // If not found by discordId, find by verified email
    if (!user && verifiedEmail) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: verifiedEmail },
            { email: verifiedEmail.toLowerCase() },
          ],
        },
      });
    }

    if (user) {
      // Link Discord Account to existing user (USER or ADMIN)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId,
          avatar: avatar || user.avatar,
        },
      });
    } else {
      let baseUsername = String(discordUser.username || "user")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase()
        .slice(0, 15);
      if (baseUsername.length < 3) baseUsername = `discord_${discordId.slice(-6)}`;

      let uniqueUsername = baseUsername;
      let attempts = 0;
      while (attempts < 10) {
        const existingName = await prisma.user.findUnique({ where: { username: uniqueUsername } });
        if (!existingName) break;
        attempts++;
        uniqueUsername = `${baseUsername.slice(0, 10)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const existingFinal = await prisma.user.findUnique({ where: { username: uniqueUsername } });
      if (existingFinal) {
        uniqueUsername = `u_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
      }

      const finalEmail = verifiedEmail || `discord_${discordId}@discord.user`;
      const emailCollision = await prisma.user.findFirst({
        where: {
          OR: [
            { email: finalEmail },
            { email: finalEmail.toLowerCase() },
          ],
        },
      });

      if (emailCollision) {
        user = await prisma.user.update({
          where: { id: emailCollision.id },
          data: {
            discordId,
            avatar: avatar || emailCollision.avatar,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            username: uniqueUsername,
            email: finalEmail,
            discordId,
            avatar,
            role: "USER",
            balance: 0.0,
          },
        });
      }
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
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Discord OAuth Error:", err);
    return NextResponse.redirect(
      new URL(
        "/login?error=" + encodeURIComponent(`เกิดข้อผิดพลาดในการเชื่อมต่อ Discord: ${errorMsg.slice(0, 80)}`),
        baseUrl
      )
    );
  }
}
