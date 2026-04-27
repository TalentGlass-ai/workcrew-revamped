import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';
import { evaluateAssessment } from '../../../../../lib/evaluator';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, answers } = await request.json();

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Attempt ID and answers required' }, { status: 400 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Get attempt with assessment and questions
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Assessment attempt not found' }, { status: 404 });
    }

    // Check if attempt belongs to candidate
    if (attempt.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create answer records
    const answerRecords = await Promise.all(
      answers.map(answer =>
        prisma.answer.create({
          data: {
            attemptId,
            questionId: answer.questionId,
            answerText: answer.answerText,
            submittedAt: new Date(),
          },
        })
      )
    );

    // Evaluate assessment
    const evaluation = await evaluateAssessment(attemptId, answers, attempt.assessment.role || undefined);

    // Update assessment with score and report
    await prisma.assessment.update({
      where: { id: attempt.assessment.id },
      data: {
        score: evaluation.score,
        report: {
          totalScore: evaluation.score,
          maxScore: evaluation.maxScore,
          percentage: evaluation.percentage,
          passed: evaluation.passed,
          feedback: evaluation.feedback,
          behavioralAnalysis: evaluation.behavioralAnalysis,
        },
      },
    });

    // Mark attempt as completed
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score: evaluation.score,
      },
    });

    return NextResponse.json({
      success: true,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      feedback: evaluation.feedback,
      behavioralAnalysis: evaluation.behavioralAnalysis,
      skillScores: evaluation.skillScores,
      evaluationBreakdown: evaluation.evaluationBreakdown,
    });
  } catch (error) {
    console.error('Assessment submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}