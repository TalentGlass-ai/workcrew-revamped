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

  // Write validated CandidateSkill records for skills scored ≥ 60
  const now2 = new Date();
  const skillUpserts: Promise<unknown>[] = [];

  // Skills from question rubric tags
  for (const [skillName, score] of Object.entries(result.skillScores)) {
    if (score >= 60) {
      skillUpserts.push(
        prisma.candidateSkill.upsert({
          where: { candidateId_skillName: { candidateId: candidate.id, skillName } },
          create: {
            candidateId: candidate.id,
            skillName,
            category: "technical",
            score: score / 10,
            source: "assessment",
            isValidated: true,
            validatedAt: now2,
            validationSource: "assessment",
            lastVerifiedAt: now2,
          },
          update: {
            score: score / 10,
            isValidated: true,
            validatedAt: now2,
            validationSource: "assessment",
            lastVerifiedAt: now2,
          },
        })
      );
    }
  }

  // Also validate the assessment language if overall score ≥ 60
  if (result.score >= 60 && attempt.assessment.language) {
    const lang = attempt.assessment.language;
    skillUpserts.push(
      prisma.candidateSkill.upsert({
        where: { candidateId_skillName: { candidateId: candidate.id, skillName: lang } },
        create: {
          candidateId: candidate.id,
          skillName: lang,
          category: "technical",
          score: result.score / 10,
          source: "assessment",
          isValidated: true,
          validatedAt: now2,
          validationSource: "assessment",
          lastVerifiedAt: now2,
        },
        update: {
          score: Math.max(result.score / 10, 0),
          isValidated: true,
          validatedAt: now2,
          validationSource: "assessment",
          lastVerifiedAt: now2,
        },
      })
    );
  }

  await Promise.all(skillUpserts);

  // Compute fraud risk from accumulated proctoring flags
  const flags = await prisma.proctoringFlag.findMany({
    where: { assessmentId: attempt.assessmentId },
    select: { severity: true },
  });
  const HIGH = flags.filter(f => f.severity === 'high').length;
  const MED  = flags.filter(f => f.severity === 'medium').length;
  const fraudRiskScore = Math.min(1, HIGH * 0.3 + MED * 0.1);

  // Persist score on attempt + assessment
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
}
