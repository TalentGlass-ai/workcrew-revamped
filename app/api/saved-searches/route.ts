import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/saved-searches?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        candidate: { userId }
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ savedSearches })
  } catch (error) {
    console.error('Saved searches fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/saved-searches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, query, location, categoryId, jobType, salaryMin, salaryMax, isRemote } = body

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      )
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        candidate: { connect: { userId } },
        name,
        query,
        location,
        categoryId,
        jobType,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        isRemote,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json({ savedSearch }, { status: 201 })
  } catch (error) {
    console.error('Saved search creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}