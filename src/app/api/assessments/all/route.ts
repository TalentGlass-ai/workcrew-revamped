import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is recruiter (employer)
    if (session.user.role !== 'employer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get all assessments with candidate and job info
    const assessments = await prisma.assessment.findMany({
      include: {
        candidate: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        job: {
          select: {
            title: true,
            id: true,
          },
        },
        assessmentAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 1, // Latest attempt
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count
    const total = await prisma.assessment.count();

    // Format response
    const response = {
      assessments: assessments.map((assessment: any) => ({
        id: assessment.id,
        score: assessment.score,
        difficulty: assessment.difficulty,
        language: assessment.language,
        timeTaken: assessment.timeTaken,
        createdAt: assessment.createdAt,
        completed: assessment.assessmentAttempts.length > 0 && assessment.assessmentAttempts[0].submittedAt !== null,
        candidate: {
          id: assessment.candidate.id,
          name: assessment.candidate.user.name,
          email: assessment.candidate.user.email,
        },
        job: assessment.job,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}