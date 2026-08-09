import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const DB_URL = process.env.DATABASE_URL ?? 'file:./dev.db';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // BetterSQLite3 adapter handles SQLite; swap for @prisma/adapter-pg when DATABASE_URL is postgres://
    adapter: new PrismaBetterSqlite3({ url: DB_URL }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Backward-compat shim — callers that used the old async getPrisma() factory still work
export const getPrisma = () => Promise.resolve(prisma);
