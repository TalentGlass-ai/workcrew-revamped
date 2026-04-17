import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'
import { syncJobToTypesense, syncCompanyToTypesense } from '../../../lib/typesense'

export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json()

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    if (type === 'job') {
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: true,
          category: true,
        },
      })

      if (job) {
        await syncJobToTypesense(job)
        return NextResponse.json({ success: true, message: 'Job synced to Typesense' })
      } else {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }
    } else if (type === 'company') {
      const company = await prisma.company.findUnique({
        where: { id },
      })

      if (company) {
        await syncCompanyToTypesense(company)
        return NextResponse.json({ success: true, message: 'Company synced to Typesense' })
      } else {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "job" or "company"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

// Bulk sync endpoint
export async function PUT(request: NextRequest) {
  try {
    const { type } = await request.json()

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 })
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    if (type === 'jobs') {
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

      return NextResponse.json({ success: true, message: `Synced ${jobs.length} jobs` })
    } else if (type === 'companies') {
      const companies = await prisma.company.findMany({
        where: { isActive: true },
      })

      for (const company of companies) {
        await syncCompanyToTypesense(company)
      }

      return NextResponse.json({ success: true, message: `Synced ${companies.length} companies` })
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "jobs" or "companies"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk sync error:', error)
    return NextResponse.json({ error: 'Bulk sync failed' }, { status: 500 })
  }
}