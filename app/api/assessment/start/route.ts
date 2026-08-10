import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({ assessmentId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any)?.role ?? 'candidate';
  if (role !== 'candidate') {
    return NextResponse.json({ error: 'Only candidates can start assessments' }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const candidate = await prisma.candidate.findFirst({
    where: { user: { email: session.user?.email! } },
  });
  if (!candidate) return NextResponse.json({ error: 'No candidate profile' }, { status: 403 });

  const assessment = await prisma.assessment.findUnique({
    where: { id: parsed.data.assessmentId },
    include: {
      questions: {
        select: {
          id: true,
          questionType: true,
          questionText: true,
          weightage: true,
          // intentionally omit expectedAnswer and scoringRubric
        },
      },
    },
  });
  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  if (assessment.candidateId !== candidate.id) {
    return NextResponse.json({ error: 'This assessment is not assigned to you' }, { status: 403 });
  }
  if (assessment.score !== null) {
    return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 });
  }

  // Prevent duplicate in-progress attempts (score is null until submitted)
  const existing = await prisma.assessmentAttempt.findFirst({
    where: {
      assessmentId: assessment.id,
      candidateId: candidate.id,
      score: null,
    },
  });

  const attempt = existing ?? await prisma.assessmentAttempt.create({
    data: {
      candidateId: candidate.id,
      assessmentId: assessment.id,
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    assessment: {
      id: assessment.id,
      difficulty: assessment.difficulty,
      language: assessment.language,
      timeTaken: assessment.timeTaken,
    },
    questions: assessment.questions,
  });
}
