import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "9f4c8e2a1b7d6f3e5a0c9b8d7e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f";
const COOKIE_NAME = "jipan_auth_token";
export const OAUTH_STATE_COOKIE = "jipan_oauth_state";

export interface SessionUser {
  id: string;
  username: string;
  role: string;
  email?: string | null;
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<(SessionUser & { balance: number }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      balance: true,
    },
  });

  return user;
}

/**
 * Returns a trusted base URL dynamically from request headers, strictly using https for live domains
 */
export function getSafeBaseUrl(req: Request): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    new URL(req.url).host;

  const proto =
    req.headers.get("x-forwarded-proto") ||
    (req.url.startsWith("https") ? "https" : "http");

  // For live domains, always enforce https
  const protocol = host.includes("localhost") ? proto : "https";

  return `${protocol}://${host}`;
}

/**
 * Auto-ensures User table on Cloudflare D1 has googleId, discordId, and avatar columns
 */
export async function ensureSocialAuthColumns() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "googleId" TEXT;`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "discordId" TEXT;`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "avatar" TEXT;`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_discordId_key" ON "User"("discordId");`);
  } catch {}
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
