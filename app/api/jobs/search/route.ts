import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'
import { calculateDistance } from '../../../../lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const latitude = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const longitude = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50 // Default 50km
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''
    const salaryMin = searchParams.get('salaryMin')
    const salaryMax = searchParams.get('salaryMax')
    const companySize = searchParams.get('companySize') || ''
    const benefits = searchParams.get('benefits')?.split(',') || []
    const isRemote = searchParams.get('isRemote') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: [query] } },
      ]
    }

    if (location && !latitude && !longitude) {
      // Text-based location search
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (latitude && longitude) {
      // Location-based search with radius
      // Note: This is a simplified approach. For production, consider using PostGIS
      where.latitude = { not: null }
      where.longitude = { not: null }
    }

    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      }
    }

    if (type) {
      where.type = type.toUpperCase()
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin) }
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseInt(salaryMax) }
    }

    if (companySize) {
      where.company = {
        size: companySize.toUpperCase()
      }
    }

    if (benefits.length > 0) {
      // For SQLite, check if any benefit is contained in the comma-separated string
      where.OR = where.OR || []
      benefits.forEach(benefit => {
        where.OR.push({
          benefits: { contains: benefit, mode: 'insensitive' }
        })
      })
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote
    }

    // Get jobs with location filtering
    let jobsQuery = prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
            size: true,
            benefits: true,
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
    })

    const [jobs, total] = await Promise.all([
      jobsQuery,
      prisma.job.count({ where }),
    ])

    // Filter by distance if coordinates provided
    let filteredJobs = jobs
    if (latitude && longitude) {
      filteredJobs = jobs.filter((job: any) => {
        if (!job.latitude || !job.longitude) return false
        const distance = calculateDistance(latitude, longitude, job.latitude, job.longitude)
        return distance <= radius
      })
    }

    return NextResponse.json({
      jobs: filteredJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()
    const prisma = await getPrisma()

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const {
      query = '',
      location = '',
      category = [],
      type = [],
      cities = [],
      skills = [],
      salaryRange = [],
      experienceLevel = [],
      isRemote,
      page = 1,
      limit = 10,
    } = filters

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ]
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Category filter
    if (category.length > 0) {
      where.category = { name: { in: category } }
    }

    // Type filter
    if (type.length > 0) {
      where.type = { in: type }
    }

    // Remote filter
    if (isRemote !== undefined) {
      where.isRemote = isRemote
    }

    // Skills filter
    if (skills.length > 0) {
      where.skills = {
        some: {
          name: { in: skills }
        }
      }
    }

    // Get total count
    const total = await prisma.job.count({ where })

    // Get paginated results
    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        skills: true,
        category: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match expected format
    const transformedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : '',
      isRemote: job.isRemote,
      skills: job.skills?.map((s: any) => s.name) || [],
      category: job.category?.name,
      experienceLevel: job.experienceLevel,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      jobs: transformedJobs,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    })

  } catch (error) {
    console.error('Advanced search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}