import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { id } = await context.params

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        jobs: {
          where: { status: 'published' },
          include: {
            category: true,
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to recent jobs
        },
        _count: {
          select: {
            jobs: {
              where: { status: 'published' }
            }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...company,
      slug: createCompanySlug(company.name, company.id),
      url: `/companies/${createCompanySlug(company.name, company.id)}`,
      jobs: company.jobs.map((job: any) => ({
        ...job,
        slug: createJobSlug(job.title, job.id),
        url: `/jobs/${createJobSlug(job.title, job.id)}`
      }))
    })
  } catch (error) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}