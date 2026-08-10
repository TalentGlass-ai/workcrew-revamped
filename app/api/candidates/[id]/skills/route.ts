import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidates/[id]/skills
 * Returns the candidate's CandidateSkill rows, with validated skills first.
 * Accessible by: the candidate themselves, or recruiters in the same org.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: candidateId } = await params;
  const user = session.user as any;

  // Resolve the requesting user's candidate ID (if they're a candidate)
  const selfCandidate = user.role === 'candidate'
    ? await prisma.candidate.findFirst({ where: { userId: user.id }, select: { id: true } })
    : null;

  const isSelf = selfCandidate?.id === candidateId;
  const isRecruiter = ['recruiter', 'hiring_manager', 'admin'].includes(user.role ?? '');

  if (!isSelf && !isRecruiter) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // For recruiters: org-scope check — candidate must have applied to an org job
  if (isRecruiter && user.role !== 'admin' && user.organizationId) {
    const hasApplication = await prisma.candidateApplication.findFirst({
      where: {
        candidateId,
        job: { organizationId: user.organizationId },
      },
    });
    if (!hasApplication) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const skills = await prisma.candidateSkill.findMany({
    where: { candidateId },
    orderBy: [{ isValidated: 'desc' }, { score: 'desc' }],
  });

  const assessments = await prisma.skillAssessment.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
  });

  // Group assessments by skill for easy lookup
  const assessmentsBySkill: Record<string, typeof assessments> = {};
  for (const a of assessments) {
    if (!assessmentsBySkill[a.skillName]) assessmentsBySkill[a.skillName] = [];
    assessmentsBySkill[a.skillName].push(a);
  }

  const result = skills.map(s => ({
    skillName: s.skillName,
    category: s.category,
    score: s.score,
    source: s.source,
    isValidated: s.isValidated,
    validatedAt: s.validatedAt,
    validationSource: s.validationSource,
    lastVerifiedAt: s.lastVerifiedAt,
    assessments: (assessmentsBySkill[s.skillName] ?? []).map(a => ({
      score: a.score,
      confidence: a.confidence,
      source: a.source,
      createdAt: a.createdAt,
    })),
  }));

  return NextResponse.json({ skills: result });
}
