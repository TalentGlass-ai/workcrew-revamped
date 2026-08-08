import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { slug } = await context.params
    const jobId = extractJobIdFromSlug(slug)

    if (!jobId) {
      return NextResponse.json({ error: 'Invalid job slug' }, { status: 400 })
    }

    const job = await prisma.job.findFirst({
      where: { id: { endsWith: jobId }, status: 'published' },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const similarJobs = await prisma.job.findMany({
      where: {
        id: { not: job.id },
        organizationId: job.organizationId,
        status: 'published',
      },
      include: {
        organization: { select: { name: true } },
      },
      take: 4,
    })

    return NextResponse.json({
      ...job,
      slug,
      url: `${request.nextUrl.origin}/jobs/${slug}`,
      similarJobs: similarJobs.map((j: any) => ({
        ...j,
        url: `/jobs/${createJobSlug(j.title, j.id)}`,
      })),
      meta: {
        title: `${job.title} at ${(job as any).organization?.name ?? 'WorkCrew.ai'} | WorkCrew.ai`,
        description: job.description.substring(0, 160).replace(/\n/g, ' ') + '…',
        canonicalUrl: `${request.nextUrl.origin}/jobs/${slug}`,
      },
    })
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
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}
