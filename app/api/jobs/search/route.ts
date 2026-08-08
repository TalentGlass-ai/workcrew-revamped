import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('type') || ''
    const salaryMin = searchParams.get('salaryMin')
    const salaryMax = searchParams.get('salaryMax')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = { status: 'published' }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (jobType) where.jobType = jobType.toUpperCase()
    if (salaryMin) where.salaryMin = { gte: parseInt(salaryMin) }
    if (salaryMax) where.salaryMax = { lte: parseInt(salaryMax) }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { organization: { select: { id: true, name: true, logo: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const { query = '', location = '', jobType = [], salaryRange = [], page = 1, limit = 10 } = await request.json()

    const where: any = { status: 'published' }
    if (query) where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (jobType.length > 0) where.jobType = { in: jobType }

    const total = await prisma.job.count({ where })
    const jobs = await prisma.job.findMany({
      where,
      include: { organization: { select: { id: true, name: true, logo: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ jobs, total, page, limit, hasMore: total > page * limit })
  } catch (error) {
    console.error('Advanced search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
