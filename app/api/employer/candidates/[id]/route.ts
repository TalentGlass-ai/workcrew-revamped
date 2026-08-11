import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getPrisma } from '../../../../../lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: candidateId } = await params;

  // Verify candidate has applied to at least one of this org's jobs
  const hasApplication = await prisma.candidateApplication.findFirst({
    where: { candidateId, job: { organizationId: user.organizationId } },
    select: { id: true },
  });
  if (!hasApplication) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      user: { select: { name: true, email: true } },
      skills: {
        orderBy: { score: 'desc' },
        select: { skillName: true, category: true, score: true, source: true },
      },
      assessments: {
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, language: true, difficulty: true, score: true, createdAt: true, job: { select: { title: true } } },
      },
      applications: {
        where: { job: { organizationId: user.organizationId } },
        orderBy: { appliedAt: 'desc' },
        select: {
          id: true,
          currentStage: true,
          status: true,
          appliedAt: true,
          aiMatchScore: true,
          job: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ candidate });
}
