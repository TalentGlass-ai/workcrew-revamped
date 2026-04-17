import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({
        jobs: [],
        category: null,
        total: 0,
        page: 1,
        totalPages: 0,
        popularLocations: [],
        categories: []
      })
    }

    const { slug } = await context.params

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const location = searchParams.get('location')
    const remote = searchParams.get('remote') === 'true'

    const skip = (page - 1) * limit

    // Decode category name from slug
    const categoryName = decodeURIComponent(slug)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case

    // Find category by name
    const category = await prisma.jobCategory.findFirst({
      where: {
        name: categoryName
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Build where clause
    const where: any = {
      isActive: true,
      categoryId: category.id,
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (remote) {
      where.isRemote = true
    }

    const [jobs, total, locations] = await Promise.all([
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
      // Get popular locations for this category
      prisma.job.findMany({
        where: {
          isActive: true,
          categoryId: category.id,
        },
        select: {
          location: true,
        },
        distinct: ['location'],
        take: 10,
      }),
    ])

    // Process locations for display
    const locationCounts = locations
      .filter((job: any) => job.location)
      .reduce((acc: Record<string, number>, job: any) => {
        const loc = job.location!.split(',')[0].trim() // Get city part
        acc[loc] = (acc[loc] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const popularLocations = (Object.entries(locationCounts) as [string, number][])
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([location, count]) => ({
        name: location,
        slug: location.toLowerCase().replace(/\s+/g, '-'),
        url: `/jobs/location/${location.toLowerCase().replace(/\s+/g, '-')}`,
        jobCount: count,
      }))

    // Add SEO-friendly URLs
    const jobsWithUrls = jobs.map((job: any) => ({
      ...job,
      url: `/jobs/${createJobSlug(job.title, job.id)}`,
      companyUrl: `/companies/${createCompanySlug(job.company.name, job.companyId)}`,
    }))

    return NextResponse.json({
      jobs: jobsWithUrls,
      category: {
        ...category,
        slug,
        url: `/jobs/category/${slug}`,
      },
      popularLocations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: {
        location,
        remote,
      },
      meta: {
        title: `${category.name} Jobs | WorkCrew.ai`,
        description: `Find ${total} ${category.name.toLowerCase()} job opportunities. Browse by location, company size, and salary range.`,
        keywords: [category.name, 'jobs', 'careers', 'employment', ...popularLocations.slice(0, 5).map(l => l.name)],
      }
    })
  } catch (error) {
    console.error('Category jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
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