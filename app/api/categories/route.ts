import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.jobCategory.findMany({
      include: {
        _count: {
          select: {
            jobs: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}