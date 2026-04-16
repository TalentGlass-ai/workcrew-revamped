import { PrismaClient } from '@prisma/client'
import { PrismaBetterSQLite } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const sqlite = new Database('./dev.db')
const adapter = new PrismaBetterSQLite(sqlite)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma