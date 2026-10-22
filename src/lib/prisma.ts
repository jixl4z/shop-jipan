import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    const ctx = getCloudflareContext({ async: false });
    const cfEnv = ctx?.env as { DB?: any } | undefined;
    if (cfEnv?.DB) {
      const adapter = new PrismaD1(cfEnv.DB);
      return new PrismaClient({ adapter });
    }
  } catch {
    // Outside Cloudflare worker context (e.g. build step, local CLI, or tests)
  }

  // Fallback for local development
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

let activePrisma: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (!activePrisma) {
      activePrisma = createPrismaClient();
    }
    const val = Reflect.get(activePrisma, prop, receiver);
    if (typeof val === "function") {
      return val.bind(activePrisma);
    }
    return val;
  },
});
