import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, totalPages: 0, popularLocations: [] })
    }

    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const location = searchParams.get('location')
    const skip = (page - 1) * limit

    // Treat the slug as a department name filter
    const department = decodeURIComponent(slug).replace(/-/g, ' ')

    const where: any = {
      status: 'published',
      department: { contains: department, mode: 'insensitive' }
    }
    if (location) where.location = { contains: location, mode: 'insensitive' }

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
      category: { name: department, slug, url: `/jobs/category/${slug}` },
      popularLocations: [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      meta: {
        title: `${department} Jobs | WorkCrew.ai`,
        description: `Find ${total} ${department.toLowerCase()} job opportunities.`,
      }
    })
  } catch (error) {
    console.error('Category jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createSlug(title: string, id: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() + '-' + id.slice(-8)
}
