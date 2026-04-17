import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '../../../../lib/typesense'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || '*'
    const location = searchParams.get('location') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''
    const isRemote = searchParams.get('isRemote') === 'true'
    const salaryMin = searchParams.get('salaryMin') ? parseFloat(searchParams.get('salaryMin')!) : undefined
    const salaryMax = searchParams.get('salaryMax') ? parseFloat(searchParams.get('salaryMax')!) : undefined
    const latitude = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
    const longitude = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'createdAt:desc'

    const result = await searchJobs({
      q: query,
      location,
      category,
      type,
      isRemote,
      salaryMin,
      salaryMax,
      latitude,
      longitude,
      radius,
      page,
      limit,
      sort,
    })

    // Transform Typesense results to match existing API format
    const jobsWithUrls = result.jobs.map((job: any) => ({
      ...job,
      url: `/jobs/${job.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${job.id}`,
      companyUrl: `/companies/${job.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      company: {
        id: job.companyId,
        name: job.companyName,
        logo: null, // Would need to fetch from DB
        location: job.location,
        size: null,
      },
      category: {
        id: job.categoryId,
        name: job.categoryName,
      },
    }))

    return NextResponse.json({
      jobs: jobsWithUrls,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1,
    })
  } catch (error) {
    console.error('Typesense search error:', error)
    // Fallback to database search if Typesense fails
    return NextResponse.json(
      { error: 'Search temporarily unavailable' },
      { status: 503 }
    )
  }
}