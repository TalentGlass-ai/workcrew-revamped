import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()

  console.log('Seeding database...')

  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
      industry: 'Technology',
      size: 'SMALL'
    },
  })

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      organizationId: organization.id,
      role: 'ADMIN',
      name: 'Test Admin',
      email: 'admin@test.com',
      status: 'active'
    },
  })

  console.log('Database seeded successfully!')
  console.log({ organization, user })

  await prisma.$disconnect()
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })