import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Backward-compat shim — callers that used the old async getPrisma() factory still work
export const getPrisma = () => Promise.resolve(prisma);
