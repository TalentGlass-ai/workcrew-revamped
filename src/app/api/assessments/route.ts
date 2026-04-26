import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateQuestion } from '../../../lib/questionGenerator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { jobId, candidateId, skill = 'JavaScript' } = await request.json();

    // Generate 5 questions for the assessment
    const questions = [];
    for (let i = 0; i < 5; i++) {
      const q = await generateQuestion(skill);
      questions.push({
        questionType: 'multiple-choice',
        questionText: q.question,
        expectedAnswer: q.correctAnswer,
        options: q.options ? JSON.stringify(q.options) : null,
        weightage: 1.0
      });
    }

    // Create assessment with questions
    const assessment = await prisma.assessment.create({
      data: {
        organizationId: 'default-org', // TODO: get from session
        candidateId,
        jobId,
        difficulty: 'medium',
        report: {},
        language: 'en',
        timeTaken: 0,
        questions: {
          create: questions
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true,
        assessmentAttempts: {
          include: {
            answers: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, answers } = await request.json();

    // Create assessment attempt if not exists
    let attempt = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId: id }
    });

    if (!attempt) {
      attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentId: id,
          candidateId: 'candidate-id', // TODO: get from session
          startedAt: new Date()
        }
      });
    }

    // Store answers
    for (const ans of answers) {
      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: ans.questionId,
          answerText: ans.answerText,
          submittedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 });
  }
}