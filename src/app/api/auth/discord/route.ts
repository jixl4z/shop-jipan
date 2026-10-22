import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSafeBaseUrl, OAUTH_STATE_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const baseUrl = getSafeBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

  const setting = await prisma.shopSetting.findUnique({ where: { id: "default" } });
  const clientId = setting?.discordClientId || process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("ร้านค้ายังไม่ได้ตั้งค่า Discord Client ID ในหน้าแอดมิน"),
        baseUrl
      )
    );
  }

  const state = crypto.randomBytes(24).toString("hex");

  const discordAuthUrl = new URL("https://discord.com/oauth2/authorize");
  discordAuthUrl.searchParams.set("client_id", clientId);
  discordAuthUrl.searchParams.set("response_type", "code");
  discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
  discordAuthUrl.searchParams.set("scope", "identify email");
  discordAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(discordAuthUrl.toString());
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
