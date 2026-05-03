// Mock Prisma client for first draft - no database
let prismaInstance: any = null

export const getPrisma = async () => {
  if (!prismaInstance) {
    // Mock client that returns empty results
    prismaInstance = {
      $connect: async () => {},
      $disconnect: async () => {},
      // Add mock methods as needed
      user: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async () => ({}),
        update: async () => ({}),
        delete: async () => ({}),
      },
      job: {
        findMany: async () => [],
        findUnique: async () => null,
        create: async () => ({}),
        update: async () => ({}),
        delete: async () => ({}),
      },
      // Add other models as needed
    }
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
