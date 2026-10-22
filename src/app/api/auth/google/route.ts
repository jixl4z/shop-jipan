import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSafeBaseUrl, OAUTH_STATE_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const baseUrl = getSafeBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const setting = await prisma.shopSetting.findUnique({ where: { id: "default" } });
  const clientId = setting?.googleClientId || process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("ร้านค้ายังไม่ได้ตั้งค่า Google Client ID ในหน้าแอดมิน"),
        baseUrl
      )
    );
  }

  const state = crypto.randomBytes(24).toString("hex");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("scope", "openid profile email");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
