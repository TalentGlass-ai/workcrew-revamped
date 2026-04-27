import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

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

    // Get assessment with questions, attempts, and answers
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: true,
        assessmentAttempts: {
          where: { candidateId: candidate.id },
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: 1, // Latest attempt
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check if assessment belongs to candidate
    if (assessment.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const attempt = assessment.assessmentAttempts[0];

    if (!attempt) {
      return NextResponse.json({ error: 'No attempt found' }, { status: 404 });
    }

    // Format response
    const response = {
      assessmentId: assessment.id,
      score: assessment.score,
      report: assessment.report,
      questions: assessment.questions.map((question: any) => {
        const answer = attempt.answers.find((a: any) => a.questionId === question.id);
        return {
          id: question.id,
          questionType: question.questionType,
          questionText: question.questionText,
          expectedAnswer: question.expectedAnswer,
          weightage: question.weightage,
          userAnswer: answer?.answerText,
          isCorrect: answer?.isCorrect,
          score: answer?.score,
        };
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assessment results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment results' },
      { status: 500 }
    );
  }
}