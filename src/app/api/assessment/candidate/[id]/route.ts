import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidateId = params.id;

    // Get the candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { user: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check permissions: candidate themselves or recruiter/hiring_manager
    const isOwner = candidate.userId === session.user.id;
    const isRecruiter = ['recruiter', 'hiring_manager', 'admin'].includes(candidate.user.role);

    if (!isOwner && !isRecruiter) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get assessments for candidate
    const assessments = await prisma.assessment.findMany({
      where: { candidateId },
      include: {
        assessmentAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 1, // Latest attempt
        },
        job: {
          select: { title: true, id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count
    const total = await prisma.assessment.count({
      where: { candidateId },
    });

    // Format response
    const response = {
      assessments: assessments.map((assessment: any) => ({
        id: assessment.id,
        score: assessment.score,
        difficulty: assessment.difficulty,
        language: assessment.language,
        timeTaken: assessment.timeTaken,
        createdAt: assessment.createdAt,
        job: assessment.job,
        completed: assessment.assessmentAttempts.length > 0 && assessment.assessmentAttempts[0].submittedAt !== null,
        attemptCount: assessment.attempts,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Candidate assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate assessments' },
      { status: 500 }
    );
  }
}