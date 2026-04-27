import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Get assessment with questions
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check if assessment belongs to candidate
    if (assessment.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create assessment attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        candidateId: candidate.id,
        assessmentId: assessmentId,
        startedAt: new Date(),
      },
    });

    // Return assessment data and attempt ID
    return NextResponse.json({
      assessmentId: assessment.id,
      attemptId: attempt.id,
      questions: assessment.questions.map((q: { id: string; questionType: string; questionText: string; weightage: number }) => ({
        id: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        weightage: q.weightage,
      })),
    });
  } catch (error) {
    console.error('Assessment start error:', error);
    return NextResponse.json(
      { error: 'Failed to start assessment' },
      { status: 500 }
    );
  }
}