import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/job-alerts?userId=...
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

    const jobAlerts = await prisma.jobAlert.findMany({
      where: {
        candidate: { userId },
        isActive: true,
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

    return NextResponse.json({ jobAlerts })
  } catch (error) {
    console.error('Job alerts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/job-alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, criteria, frequency = 'DAILY', searchId } = body

    if (!userId || !name || !criteria) {
      return NextResponse.json(
        { error: 'User ID, name, and criteria are required' },
        { status: 400 }
      )
    }

    const jobAlert = await prisma.jobAlert.create({
      data: {
        candidate: { connect: { userId } },
        name,
        criteria,
        frequency,
        searchId,
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

    return NextResponse.json({ jobAlert }, { status: 201 })
  } catch (error) {
    console.error('Job alert creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/job-alerts/[id]
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    const jobAlert = await prisma.jobAlert.update({
      where: { id: alertId },
      data: { isActive },
    })

    return NextResponse.json({ jobAlert })
  } catch (error) {
    console.error('Job alert update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}