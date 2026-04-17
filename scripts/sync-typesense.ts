import { getPrisma } from '../lib/prisma'
import { syncJobToTypesense, syncCompanyToTypesense, initializeCollections, isTypesenseAvailable } from '../lib/typesense'

async function syncAllData() {
  console.log('Starting data sync to Typesense...')

  try {
    // Check if Typesense is available
    const typesenseAvailable = await isTypesenseAvailable()
    if (!typesenseAvailable) {
      console.log('Typesense is not available. Skipping sync. Please start Typesense server first.')
      console.log('To start Typesense: docker-compose -f docker-compose.typesense.yml up -d')
      return
    }

    // Initialize collections
    await initializeCollections()

    const prisma = await getPrisma()
    if (!prisma) {
      throw new Error('Database not available')
    }

    // Sync all active jobs
    console.log('Syncing jobs...')
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: true,
        category: true,
      },
    })

    for (const job of jobs) {
      await syncJobToTypesense(job)
    }
    console.log(`Synced ${jobs.length} jobs`)

    // Sync all active companies
    console.log('Syncing companies...')
    const companies = await prisma.company.findMany({
      where: { isActive: true },
    })

    for (const company of companies) {
      await syncCompanyToTypesense(company)
    }
    console.log(`Synced ${companies.length} companies`)

    console.log('Data sync completed successfully!')
  } catch (error) {
    console.error('Error during data sync:', error)
    process.exit(1)
  }
}

// Run the sync
syncAllData()