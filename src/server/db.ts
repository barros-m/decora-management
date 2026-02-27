import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  // Don't hard-crash at import time (e.g. during `next build`). If runtime code
  // touches the client without `DATABASE_URL`, we throw a clear error then.
  if (!connectionString) {
    const message = "DATABASE_URL is not set.";
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error(message);
      },
    });
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
