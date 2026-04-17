import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ city: string }>
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
        total: 0,
        page: 1,
        totalPages: 0,
        categories: []
      })
    }

    const { city } = await context.params

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const remote = searchParams.get('remote') === 'true'

    const skip = (page - 1) * limit

    // Decode and format city name
    const cityName = decodeURIComponent(city)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case

    // Build where clause
    const where: any = {
      isActive: true,
      location: {
        contains: cityName,
        mode: 'insensitive'
      }
    }

    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      }
    }

    if (remote) {
      where.isRemote = true
    }

    const [jobs, total, categories] = await Promise.all([
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
      // Get category counts for this location
      prisma.jobCategory.findMany({
        include: {
          _count: {
            select: {
              jobs: {
                where: {
                  isActive: true,
                  location: { contains: cityName }
                }
              }
            }
          }
        },
        orderBy: {
          jobs: {
            _count: 'desc'
          }
        },
        take: 10,
      }),
    ])

    // Add SEO-friendly URLs
    const jobsWithUrls = jobs.map((job: any) => ({
      ...job,
      url: `/jobs/${createJobSlug(job.title, job.id)}`,
      companyUrl: `/companies/${createCompanySlug(job.company.name, job.companyId)}`,
    }))

    const categoriesWithUrls = categories
      .filter((cat: any) => cat._count.jobs > 0)
      .map((cat: any) => ({
        ...cat,
        url: `/jobs/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        jobCount: cat._count.jobs,
      }))

    return NextResponse.json({
      jobs: jobsWithUrls,
      location: {
        name: cityName,
        slug: city,
        url: `/jobs/location/${city}`,
      },
      categories: categoriesWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: {
        category,
        remote,
      },
      meta: {
        title: `Jobs in ${cityName} | WorkCrew.ai`,
        description: `Find ${total} job opportunities in ${cityName}. Browse by category, company size, and salary range.`,
        keywords: [cityName, 'jobs', 'careers', 'employment', ...categoriesWithUrls.slice(0, 5).map((c: any) => c.name)],
      }
    })
  } catch (error) {
    console.error('Location jobs error:', error)
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