import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error('DATABASE_URL is not set');

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: DB_URL }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Backward-compat shim — callers that used the old async getPrisma() factory still work
export const getPrisma = () => Promise.resolve(prisma);
