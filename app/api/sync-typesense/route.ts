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
        include: { organization: true },
      })
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      await syncJobToTypesense(job)
      return NextResponse.json({ success: true, message: 'Job synced to Typesense' })
    }

    if (type === 'company') {
      const org = await prisma.organization.findUnique({ where: { id } })
      if (!org) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      await syncCompanyToTypesense(org)
      return NextResponse.json({ success: true, message: 'Company synced to Typesense' })
    }

    return NextResponse.json({ error: 'Invalid type. Must be "job" or "company"' }, { status: 400 })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type } = await request.json()
    if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })

    const prisma = await getPrisma()
    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

    if (type === 'jobs') {
      const jobs = await prisma.job.findMany({
        where: { status: 'published' },
        include: { organization: true },
      })
      for (const job of jobs) await syncJobToTypesense(job)
      return NextResponse.json({ success: true, message: `Synced ${jobs.length} jobs` })
    }

    if (type === 'companies') {
      const orgs = await prisma.organization.findMany()
      for (const org of orgs) await syncCompanyToTypesense(org)
      return NextResponse.json({ success: true, message: `Synced ${orgs.length} companies` })
    }

    return NextResponse.json({ error: 'Invalid type. Must be "jobs" or "companies"' }, { status: 400 })
  } catch (error) {
    console.error('Bulk sync error:', error)
    return NextResponse.json({ error: 'Bulk sync failed' }, { status: 500 })
  }
}
