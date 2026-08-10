import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { evaluateAssessment } from '@/lib/evaluator';
import { z } from 'zod';

const schema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    answerText: z.string(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { attemptId, answers } = parsed.data;

  const candidate = await prisma.candidate.findFirst({
    where: { user: { email: session.user?.email! } },
  });
  if (!candidate) return NextResponse.json({ error: 'No candidate profile' }, { status: 403 });

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { assessment: true },
  });
  if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  if (attempt.candidateId !== candidate.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (attempt.score !== null) {
    return NextResponse.json({ error: 'Assessment already submitted' }, { status: 400 });
  }

  // Save answers to DB
  await prisma.answer.createMany({
    data: answers.map(a => ({
      attemptId,
      questionId: a.questionId,
      answerText: a.answerText,
    })),
  });

  // Run evaluation
  const result = await evaluateAssessment(attemptId, answers);

  const now = new Date();
  const timeTaken = Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000);

  // Persist score on attempt + assessment
  await prisma.$transaction([
    prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { score: result.score, submittedAt: now },
    }),
    prisma.assessment.update({
      where: { id: attempt.assessmentId },
      data: { score: result.score, timeTaken },
    }),
  ]);

  return NextResponse.json({ result });
}
