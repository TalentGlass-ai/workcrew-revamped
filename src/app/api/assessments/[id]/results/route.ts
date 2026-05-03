import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/types/prisma';
import { SkillProcessor } from '../../../../../lib/skillProcessor';

const prisma = new PrismaClient();
const skillProcessor = new SkillProcessor(prisma);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Get assessment with all related data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        job: true,
        candidate: true,
        questions: {
          include: {
            answers: true
          }
        },
        assessmentAttempts: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Update skills from assessment results
    await skillProcessor.updateSkillsFromAssessment(assessmentId);

    // Calculate results
    const totalQuestions = assessment.questions.length;
    const answeredQuestions = assessment.questions.filter((q: any) => q.answers.length > 0).length;
    const correctAnswers = assessment.questions.filter((q: any) =>
      q.answers.some((a: any) => a.isCorrect === true)
    ).length;

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const results = {
      assessmentId,
      candidateId: assessment.candidateId,
      jobId: assessment.jobId,
      score,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      skills_updated: true,
      questions: assessment.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        answers: q.answers.map((a: any) => ({
          id: a.id,
          answerText: a.answerText,
          isCorrect: a.isCorrect,
          score: a.score
        }))
      }))
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment results' }, { status: 500 });
  }
}