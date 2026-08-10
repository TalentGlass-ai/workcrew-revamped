import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { evaluateAssessment } from '@/lib/evaluator';
import { updateCandidateSkillIntelligence } from '@/lib/services/skill-updater';
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

  try {
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

    // Build skill scores: per-skill breakdown + the assessment language itself
    const skillScores: Record<string, number> = { ...result.skillScores };
    if (attempt.assessment.language) {
      skillScores[attempt.assessment.language] = Math.max(
        skillScores[attempt.assessment.language] ?? 0,
        result.score,
      );
    }

    // Validate skills, write SkillAssessment records, refresh skill intelligence snapshot
    await updateCandidateSkillIntelligence(candidate.id, skillScores, 'assessment', {
      assessmentId: attempt.assessmentId,
      attemptId,
    });

    // Compute fraud risk from accumulated proctoring flags
    const flags = await prisma.proctoringFlag.findMany({
      where: { assessmentId: attempt.assessmentId },
      select: { severity: true },
    });
    const HIGH = flags.filter(f => f.severity === 'high').length;
    const MED  = flags.filter(f => f.severity === 'medium').length;
    const fraudRiskScore = Math.min(1, HIGH * 0.3 + MED * 0.1);

    await prisma.$transaction([
      prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: { score: result.score, submittedAt: now, fraudRiskScore },
      }),
      prisma.assessment.update({
        where: { id: attempt.assessmentId },
        data: { score: result.score, timeTaken },
      }),
    ]);

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[assessment/submit]', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
