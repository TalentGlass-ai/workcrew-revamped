// Dynamic Prisma client to avoid initialization during build
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

let prismaInstance: any = null

export const getPrisma = async () => {
  if (!prismaInstance) {
    const adapter = new PrismaBetterSqlite3(new Database('./dev.db'))

    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
    })
  }
  return prismaInstance
}

// For backward compatibility, export a proxy that calls getPrisma
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const client = await getPrisma()
      if (!client) {
        throw new Error('Database not available')
      }
      const method = client[prop]
      if (typeof method === 'function') {
        return method.apply(client, args)
      }
      return method
    }
  }
})