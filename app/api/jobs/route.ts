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
    const remote = searchParams.get('remote') === 'true'
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const q = searchParams.get('q')
    const sort = searchParams.get('sort') || 'newest' // 'newest', 'featured', 'salary'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published',
    }

    if (featured) {
      // For now, consider recent jobs as featured
      // In production, add a featured field to jobs
      where.createdAt = {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }

    if (remote) {
      where.isRemote = true
    }

    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      }
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { skills: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' }

    if (sort === 'featured') {
      orderBy = [
        { createdAt: 'desc' }, // Featured first (recent = featured)
        { createdAt: 'desc' }
      ]
    } else if (sort === 'salary') {
      orderBy = { salaryMax: 'desc' }
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              location: true,
              size: true,
            }
          },
          category: {
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

    // Add SEO-friendly URLs
    const jobsWithUrls = jobs.map((job: any) => ({
      ...job,
      url: `/jobs/${createJobSlug(job.title, job.id)}`,
      companyUrl: `/companies/${createCompanySlug(job.company.name, job.companyId)}`,
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
      filters: {
        featured,
        remote,
        category,
        location,
        q,
        sort,
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

// Helper functions for SEO-friendly URLs
function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
  return `${slug}-${id.slice(-8)}` // Add last 8 chars of ID for uniqueness
}

function createCompanySlug(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}