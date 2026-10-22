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
    stmtInfo: null,
    prismaError: null,
    prismaCount: null,
  };

  try {
    const ctx = getCloudflareContext();
    result.cfContext = {
      hasEnv: Boolean(ctx?.env),
      hasDB: Boolean((ctx?.env as any)?.DB),
      envKeys: ctx?.env ? Object.keys(ctx.env) : [],
    };

    if ((ctx?.env as any)?.DB) {
      const db = (ctx.env as any).DB;
      const stmt = db.prepare("SELECT count(*) as cnt FROM User");
      result.stmtInfo = {
        stmtType: typeof stmt,
        hasBind: typeof stmt?.bind,
        bindCall: typeof stmt?.bind(),
      };

      try {
        const adapter = new PrismaD1(db);
        result.adapterInfo = {
          adapterType: typeof adapter,
          adapterName: (adapter as any).adapterName,
          provider: (adapter as any).provider,
        };

        const p = new PrismaClient({ adapter });
        result.clientCreated = true;

        // Try raw query on prisma first
        try {
          const rawResult = await p.$queryRawUnsafe("SELECT 1 as num");
          result.prismaRaw = rawResult;
        } catch (rawErr: any) {
          result.prismaRawError = rawErr.message || String(rawErr);
        }

        const count = await p.user.count();
        result.prismaCount = count;
      } catch (pErr: any) {
        result.prismaError = {
          message: pErr.message || String(pErr),
          stack: pErr.stack || String(pErr),
        };
      }
    }
  } catch (err: any) {
    result.cfError = err.message || String(err);
  }

  return NextResponse.json(result);
}
