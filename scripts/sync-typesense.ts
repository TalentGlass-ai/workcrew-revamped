import { getPrisma } from '../lib/prisma'
import { syncJobToTypesense, syncCompanyToTypesense, initializeCollections, isTypesenseAvailable } from '../lib/typesense'

async function syncAllData() {
  console.log('Starting data sync to Typesense...')

  try {
    const typesenseAvailable = await isTypesenseAvailable()
    if (!typesenseAvailable) {
      console.log('Typesense is not available. Skipping sync.')
      return
    }

    await initializeCollections()

    const prisma = await getPrisma()
    if (!prisma) throw new Error('Database not available')

    console.log('Syncing jobs...')
    const jobs = await prisma.job.findMany({
      where: { status: 'published' },
      include: { organization: true },
    })
    for (const job of jobs) await syncJobToTypesense(job)
    console.log(`Synced ${jobs.length} jobs`)

    console.log('Syncing organizations...')
    const orgs = await prisma.organization.findMany()
    for (const org of orgs) await syncCompanyToTypesense(org)
    console.log(`Synced ${orgs.length} organizations`)

    console.log('Data sync completed successfully!')
  } catch (error) {
    console.error('Error during data sync:', error)
    process.exit(1)
  }
}

syncAllData()
