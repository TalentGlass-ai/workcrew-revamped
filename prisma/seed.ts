import 'dotenv/config'
import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'
import { prisma } from '../lib/prisma'

const scryptAsync = promisify(scrypt)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }

// Must match app/api/auth/signup/route.ts so NextAuth can verify the hash
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await (scryptAsync as Function)(password, salt, 64, SCRYPT_PARAMS)) as Buffer
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString('hex')}`
}

async function main() {
  console.log('Seeding database...')
  const pw = await hashPassword('Password123!')

  const organization = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: { name: 'Test Organization', slug: 'test-org', industry: 'Technology', size: 'small', subscriptionPlan: 'pro' },
  })

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@test.com' },
    update: {},
    create: {
      organizationId: organization.id, role: 'recruiter',
      firstName: 'Rita', lastName: 'Recruiter', name: 'Rita Recruiter',
      email: 'recruiter@test.com', passwordHash: pw, status: 'active', onboarded: true,
    },
  })

  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@test.com' },
    update: {},
    create: {
      role: 'candidate', firstName: 'Cara', lastName: 'Candidate', name: 'Cara Candidate',
      email: 'candidate@test.com', passwordHash: pw, status: 'active', onboarded: true,
    },
  })

  await prisma.candidate.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id, currentRole: 'Frontend Engineer', totalExperience: 4,
      profileSummary: 'Frontend engineer focused on React and TypeScript.',
      primarySkills: ['React', 'TypeScript', 'Next.js', 'CSS'],
      skillClusters: ['Frontend Engineer'],
    },
  })

  const existingJob = await prisma.job.findFirst({ where: { organizationId: organization.id, title: 'Senior Frontend Engineer' } })
  if (!existingJob) {
    await prisma.job.create({
      data: {
        organizationId: organization.id, createdBy: recruiter.id,
        title: 'Senior Frontend Engineer',
        description: 'Build delightful UIs with React, TypeScript, and Next.js. 4+ years experience preferred.',
        status: 'published', publishedAt: new Date(), jobType: 'full-time', location: 'Remote',
        salaryMin: 120000, salaryMax: 160000,
        requiredSkills: ['React', 'TypeScript'] as unknown as object,
        preferredSkills: ['Next.js'] as unknown as object,
        skillClusters: [] as unknown as object,
      },
    })
  }

  console.log('Seeded: org=%s recruiter=%s candidate=%s (password: Password123!)', organization.slug, recruiter.email, candidateUser.email)
  await prisma.$disconnect()
}

main().catch(async (e) => { console.error(e); process.exit(1) })
