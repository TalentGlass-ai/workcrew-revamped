// Dynamic Prisma client to avoid initialization during build
let prismaInstance: any = null

export const getPrisma = async () => {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')

    prismaInstance = new PrismaClient({
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