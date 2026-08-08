import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ city: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, totalPages: 0, categories: [] })
    }

    const { city } = await context.params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const cityName = decodeURIComponent(city).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    const where: any = {
      status: 'published',
      location: { contains: cityName, mode: 'insensitive' }
    }

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
      jobs: jobs.map((job) => ({ ...job, url: `/jobs/${createSlug(job.title, job.id)}` })),
      location: { name: cityName, slug: city, url: `/jobs/location/${city}` },
      categories: [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      meta: {
        title: `Jobs in ${cityName} | WorkCrew.ai`,
        description: `Find ${total} job opportunities in ${cityName}.`,
      }
    })
  } catch (error) {
    console.error('Location jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createSlug(title: string, id: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() + '-' + id.slice(-8)
}
