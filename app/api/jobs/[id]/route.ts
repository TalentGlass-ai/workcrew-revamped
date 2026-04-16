import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        category: true,
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}