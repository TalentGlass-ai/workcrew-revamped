import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { indexJob, indexCompany } from '../lib/typesense'

async function main() {
  const adapter = new PrismaBetterSqlite3({
    fileName: process.env.DATABASE_URL!.replace('file:', ''),
  })
  
  const prisma = new PrismaClient({ adapter })
  // Create categories
  const categories = await Promise.all([
    prisma.jobCategory.upsert({
      where: { name: 'Software Development' },
      update: {},
      create: { name: 'Software Development' },
    }),
    prisma.jobCategory.upsert({
      where: { name: 'Design' },
      update: {},
      create: { name: 'Design' },
    }),
    prisma.jobCategory.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: { name: 'Marketing' },
    }),
    prisma.jobCategory.upsert({
      where: { name: 'Sales' },
      update: {},
      create: { name: 'Sales' },
    }),
  ])

  // Create companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: 'TechCorp' },
      update: {},
      create: {
        name: 'TechCorp',
        description: 'Leading technology company',
        website: 'https://techcorp.com',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        industry: 'Technology',
        size: 'LARGE',
        benefits: 'Health Insurance,401k,Remote Work,Flexible Hours',
      },
    }),
    prisma.company.upsert({
      where: { name: 'DesignStudio' },
      update: {},
      create: {
        name: 'DesignStudio',
        description: 'Creative design agency',
        website: 'https://designstudio.com',
        location: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        industry: 'Design',
        size: 'SMALL',
        benefits: 'Creative Freedom,Health Insurance,Flexible Hours',
      },
    }),
  ])

  // Create jobs
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-1' },
      update: {},
      create: {
        id: 'job-1',
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer to join our team...',
        companyId: companies[0].id,
        categoryId: categories[0].id,
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        salaryMin: 120000,
        salaryMax: 180000,
        type: 'FULL_TIME',
        experience: '5+ years',
        skills: 'JavaScript,TypeScript,React,Node.js',
        benefits: 'Health Insurance,Stock Options,Remote Work',
        isRemote: true,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-2' },
      update: {},
      create: {
        id: 'job-2',
        title: 'UX Designer',
        description: 'Join our design team to create amazing user experiences...',
        companyId: companies[1].id,
        categoryId: categories[1].id,
        location: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        salaryMin: 80000,
        salaryMax: 120000,
        type: 'FULL_TIME',
        experience: '3+ years',
        skills: 'Figma,Sketch,Adobe XD,User Research',
        benefits: 'Health Insurance,Creative Tools,Flexible Hours',
        isRemote: false,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-3' },
      update: {},
      create: {
        id: 'job-3',
        title: 'Marketing Manager',
        description: 'Lead our marketing efforts and drive growth...',
        companyId: companies[0].id,
        categoryId: categories[2].id,
        location: 'Remote',
        salaryMin: 90000,
        salaryMax: 130000,
        type: 'FULL_TIME',
        experience: '4+ years',
        skills: 'Digital Marketing,SEO,Content Strategy,Analytics',
        benefits: 'Health Insurance,Performance Bonus,Remote Work',
        isRemote: true,
      },
    }),
  ])

  // Index jobs and companies to Typesense
  console.log('Indexing data to Typesense...')
  try {
    // Index companies
    for (const company of companies) {
      await indexCompany(company.id)
    }

    // Index jobs
    for (const job of jobs) {
      await indexJob(job.id)
    }

    console.log('Data indexed successfully')
  } catch (error) {
    console.log('Typesense indexing failed (this is OK if Typesense is not running):', error)
  }

  // Create sample candidate profile
  const candidate = await prisma.candidateProfile.upsert({
    where: { userId: 'sample-user-123' },
    update: {},
    create: {
      userId: 'sample-user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      bio: 'Experienced software engineer passionate about building great products',
      experience: '5+ years',
      preferredSalaryMin: 100000,
      preferredSalaryMax: 160000,
      willingToRelocate: true,
    },
  })

  // Add candidate skills
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candidate.id, skillName: 'JavaScript', proficiency: 'Expert' },
      { candidateId: candidate.id, skillName: 'TypeScript', proficiency: 'Expert' },
      { candidateId: candidate.id, skillName: 'React', proficiency: 'Expert' },
      { candidateId: candidate.id, skillName: 'Node.js', proficiency: 'Advanced' },
      { candidateId: candidate.id, skillName: 'Python', proficiency: 'Intermediate' },
    ],
    skipDuplicates: true,
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })