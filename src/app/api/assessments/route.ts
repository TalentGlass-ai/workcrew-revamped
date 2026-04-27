import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentQuestions, getPackDetails } from '../../../../lib/questionGenerator';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { jobId, candidateId, skill = 'JavaScript', role } = await request.json();

    // Get assessment pack if role is specified
    const pack = role ? getPackDetails(role) : null;

    // Generate questions using assessment pack or fallback to skill-based
    const generatedQuestions = await generateAssessmentQuestions(skill, 5, role);

    // Convert to database format
    const questions = generatedQuestions.map(q => ({
      questionType: q.questionType,
      questionText: q.question,
      expectedAnswer: q.correctAnswer,
      options: q.options ? JSON.stringify(q.options) : null,
      weightage: q.weightage,
      skills: q.skills,
      codeTemplate: q.codeTemplate,
      testCases: q.testCases ? JSON.stringify(q.testCases) : null
    }));

    // Create assessment with questions
    const assessment = await prisma.assessment.create({
      data: {
        organizationId: 'default-org', // TODO: get from session
        candidateId,
        jobId,
        difficulty: pack ? 'adaptive' : 'medium',
        language: skill,
        role: role || null,
        report: {},
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single assessment
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
    } else {
      // Get candidate
      const candidate = await prisma.candidate.findUnique({
        where: { userId: session.user.id },
      });

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
      }

      // Get assessments for this candidate
      const assessments = await prisma.assessment.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: true,
          questions: {
            select: {
              id: true,
              questionType: true,
            },
          },
          assessmentAttempts: {
            select: {
              id: true,
              completedAt: true,
              score: true,
            },
            orderBy: { startedAt: 'desc' },
            take: 1, // Latest attempt
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Format for frontend
      const formattedAssessments = assessments.map((assessment: any) => ({
        id: assessment.id,
        title: assessment.job ? `Assessment for ${assessment.job.title}` : `Coding Assessment`,
        description: `Test your ${assessment.language} skills with ${assessment.questions.length} questions`,
        difficulty: assessment.difficulty,
        language: assessment.language,
        createdAt: assessment.createdAt,
        isCompleted: assessment.assessmentAttempts.length > 0 && assessment.assessmentAttempts[0].completedAt !== null,
        score: assessment.assessmentAttempts[0]?.score || null,
        questionCount: assessment.questions.length,
      }));

      return NextResponse.json({ assessments: formattedAssessments });
    }
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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