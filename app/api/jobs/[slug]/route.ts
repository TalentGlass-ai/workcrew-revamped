import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'contract': 'CONTRACTOR',
  'internship': 'INTERN',
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const prisma = await getPrisma()
    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

    const { slug } = await context.params
    const jobId = extractJobIdFromSlug(slug)
    if (!jobId) return NextResponse.json({ error: 'Invalid job slug' }, { status: 400 })

    const job = await prisma.job.findFirst({
      where: { id: { endsWith: jobId }, status: 'published' },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    })

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const similarJobs = await prisma.job.findMany({
      where: { id: { not: job.id }, organizationId: job.organizationId, status: 'published' },
      include: { organization: { select: { name: true } } },
      take: 4,
    })

    const origin = request.nextUrl.origin
    const jobUrl = `${origin}/jobs/${slug}`
    const companyName = job.organization.name
    const skills: string[] = Array.isArray(job.requiredSkills)
      ? (job.requiredSkills as string[])
      : Object.keys(job.requiredSkills as object ?? {})

    const keywords = [
      job.title,
      companyName,
      job.location ?? 'Remote',
      job.jobType ?? '',
      'jobs', 'careers', 'hiring',
      ...skills.slice(0, 5),
    ].filter(Boolean)

    // Google Jobs structured data
    const structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.publishedAt?.toISOString() ?? job.createdAt.toISOString(),
      hiringOrganization: {
        '@type': 'Organization',
        name: companyName,
        sameAs: `${origin}/companies/${job.organization.slug ?? job.organizationId}`,
      },
      jobLocation: job.location
        ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location } }
        : { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Remote' } },
      ...(job.jobType && { employmentType: EMPLOYMENT_TYPE[job.jobType] ?? job.jobType.toUpperCase() }),
      ...(skills.length > 0 && { skills: skills.join(', ') }),
    }

    if (job.salaryMin || job.salaryMax) {
      structuredData.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          ...(job.salaryMin && { minValue: job.salaryMin }),
          ...(job.salaryMax && { maxValue: job.salaryMax }),
          unitText: 'YEAR',
        },
      }
    }

    return NextResponse.json({
      ...job,
      // Normalise: page expects `company`, API has `organization`
      company: { name: companyName, id: job.organization.id },
      category: { name: job.jobType ?? 'Jobs' },
      slug,
      url: jobUrl,
      structuredData,
      meta: {
        title: `${job.title} at ${companyName} | WorkCrew.ai`,
        description: (job.description.substring(0, 155).replace(/\n/g, ' ') + `… at ${companyName}${job.location ? ` in ${job.location}` : ''}`),
        keywords,
        canonicalUrl: jobUrl,
      },
      similarJobs: similarJobs.map((j: any) => ({
        ...j,
        url: `/jobs/${createJobSlug(j.title, j.id)}`,
      })),
    }, { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } })
  } catch (error) {
    console.error('Job detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractJobIdFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  if (parts.length < 2) return null
  const idPart = parts[parts.length - 1]
  return idPart.length >= 6 ? idPart : null
}

function createJobSlug(title: string, id: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() + '-' + id.slice(-8)
}
