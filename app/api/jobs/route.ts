import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, totalPages: 0 })
    }

    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured') === 'true'
    const location = searchParams.get('location')
    const q = searchParams.get('q')
    const sort = searchParams.get('sort') || 'newest'

    const skip = (page - 1) * limit

    const where: any = {
      status: 'published',
    }

    if (featured) {
      where.createdAt = {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    if (location) {
      where.location = { contains: location }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'salary') {
      orderBy = { salaryMax: 'desc' }
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.job.count({ where }),
    ])

    const jobsWithUrls = jobs.map((job: any) => ({
      ...job,
      url: `/jobs/${createJobSlug(job.title, job.id)}`,
    }))

    return NextResponse.json({
      jobs: jobsWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Jobs listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}
