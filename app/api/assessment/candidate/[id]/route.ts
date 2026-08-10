import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any)?.role ?? 'candidate';
  if (role !== 'recruiter' && role !== 'admin') {
    return NextResponse.json({ error: 'Recruiters only' }, { status: 403 });
  }

  const { id: candidateId } = await params;

  // Verify recruiter is in the same org as the assessments
  const recruiter = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    select: { organizationId: true },
  });
  if (!recruiter?.organizationId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 403 });
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      candidateId,
      organizationId: recruiter.organizationId,
    },
    include: {
      job: { select: { title: true } },
      assessmentAttempts: {
        select: {
          id: true,
          score: true,
          fraudRiskScore: true,
          startedAt: true,
          submittedAt: true,
        },
        orderBy: { startedAt: 'desc' },
      },
      proctoringFlags: {
        select: { reason: true, severity: true, flaggedAt: true, reviewed: true },
        orderBy: { flaggedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const flagCounts = assessments.reduce(
    (acc, a) => {
      acc.total += a.proctoringFlags.length;
      acc.unreviewed += a.proctoringFlags.filter(f => !f.reviewed).length;
      return acc;
    },
    { total: 0, unreviewed: 0 }
  );

  return NextResponse.json({ assessments, flagCounts });
}
