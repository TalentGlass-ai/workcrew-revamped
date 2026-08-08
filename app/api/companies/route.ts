import { NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ companies: [] })
    }

    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { jobs: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      companies: orgs.map((org) => ({
        ...org,
        slug: createSlug(org.name, org.id),
        url: `/companies/${createSlug(org.name, org.id)}`
      }))
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createSlug(name: string, id: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  return `${slug}-${id.slice(-8)}`
}
