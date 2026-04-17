import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const {
      sessionId,
      candidateId,
      jobId,
      action,
      metadata,
      userAgent,
      referrer,
      timestamp
    } = body

    // Validate required fields
    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'sessionId and action are required' },
        { status: 400 }
      )
    }

    // Validate action type
    const validActions = [
      'view', 'apply', 'save', 'unsave', 'share',
      'contact', 'recommend', 'search', 'filter'
    ]

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Create interaction record
    const interaction = await prisma.userInteraction.create({
      data: {
        sessionId,
        candidateId,
        jobId,
        action,
        metadata: metadata || {},
        userAgent,
        referrer,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      interactionId: interaction.id
    })

  } catch (error) {
    console.error('Analytics interaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving interaction analytics (for admins/ML training)
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')
    const jobId = searchParams.get('jobId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (candidateId) where.candidateId = candidateId
    if (jobId) where.jobId = jobId
    if (action) where.action = action

    const interactions = await prisma.userInteraction.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.userInteraction.count({ where })

    return NextResponse.json({
      interactions,
      total,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}