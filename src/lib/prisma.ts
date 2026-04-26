import { PrismaClient } from "@prisma/client";

// Singleton Prisma client. Returns null at runtime if DATABASE_URL isn't
// configured, so the rest of the app can degrade gracefully (open beta /
// no-DB testing mode).

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | null | undefined;
}

function build(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return new PrismaClient({ log: ["error"] });
  } catch {
    return null;
  }
}

export const prisma: PrismaClient | null =
  globalThis.prisma ?? (globalThis.prisma = build());
