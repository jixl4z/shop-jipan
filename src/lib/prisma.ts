import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let cachedD1Client: PrismaClient | null = null;

function getClient(): PrismaClient {
  try {
    const ctx = getCloudflareContext();
    const cfEnv = ctx?.env as { DB?: any } | undefined;
    if (cfEnv?.DB) {
      if (!cachedD1Client) {
        const adapter = new PrismaD1(cfEnv.DB);
        cachedD1Client = new PrismaClient({ adapter });
      }
      return cachedD1Client;
    }
  } catch {
    // Outside Cloudflare worker context (e.g. local dev, CLI, build step)
  }

  const g = globalThis as unknown as { prisma?: PrismaClient };
  if (!g.prisma) {
    g.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return g.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getClient();
    const val = Reflect.get(client, prop, receiver);
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});
