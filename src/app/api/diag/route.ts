import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cfContext: null,
    cfError: null,
    d1Query: null,
    prismaError: null,
    userCount: null,
  };

  try {
    const ctx = getCloudflareContext();
    result.cfContext = {
      hasEnv: Boolean(ctx?.env),
      hasDB: Boolean((ctx?.env as any)?.DB),
      envKeys: ctx?.env ? Object.keys(ctx.env) : [],
    };

    if ((ctx?.env as any)?.DB) {
      // Test direct D1 query first!
      try {
        const raw = await (ctx.env as any).DB.prepare("SELECT count(*) as cnt FROM User").first();
        result.d1Query = raw;
      } catch (d1Err: any) {
        result.d1Query = { error: d1Err.message || String(d1Err) };
      }

      // Test Prisma with D1 adapter
      try {
        const adapter = new PrismaD1((ctx.env as any).DB);
        const p = new PrismaClient({ adapter });
        const count = await p.user.count();
        result.userCount = count;
      } catch (pErr: any) {
        result.prismaError = pErr.message || String(pErr);
      }
    }
  } catch (err: any) {
    result.cfError = err.message || String(err);
  }

  return NextResponse.json(result);
}
