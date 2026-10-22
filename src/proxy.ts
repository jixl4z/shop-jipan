import { NextRequest, NextResponse } from "next/server";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CSRF Origin Verification for all state-changing API requests
  if (pathname.startsWith("/api/") && STATE_CHANGING_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "CSRF Protection: Invalid Origin Header" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF Protection: Malformed Origin Header" },
          { status: 403 }
        );
      }
    }
  }

  // 2. Fast Edge Pre-Check for /api/admin/* (Requires Auth Cookie)
  if (pathname.startsWith("/api/admin/")) {
    const token = req.cookies.get("jipan_auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
