import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ companies: [] })
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            jobs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      companies: companies.map((company: any) => ({
        ...company,
        slug: createCompanySlug(company.name, company.id),
        url: `/companies/${createCompanySlug(company.name, company.id)}`
      }))
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
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