import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

const STAGES = ['applied', 'screening', 'interview', 'offer', 'hired'] as const;
type Stage = typeof STAGES[number];

// PATCH /api/applications/[id] — recruiter advances stage or sets status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { stage, status } = body as { stage?: Stage; status?: 'rejected' | 'hired' };

  // Verify recruiter owns the job this application belongs to
  const application = await prisma.candidateApplication.findUnique({
    where: { id },
    include: { job: { select: { organizationId: true } } },
  });
  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  if (user?.organizationId !== application.job.organizationId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data: Record<string, string> = {};
  if (stage && STAGES.includes(stage)) data.currentStage = stage;
  if (status === 'rejected' || status === 'hired') {
    data.status = status;
    if (status === 'hired') data.currentStage = 'hired';
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Provide stage or status' }, { status: 400 });
  }

  const updated = await prisma.candidateApplication.update({ where: { id }, data });
  return NextResponse.json({ application: updated });
}

// DELETE /api/applications/[id] — withdraw an application
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const application = await prisma.candidateApplication.findFirst({
    where: { id, candidateId: candidate.id },
  });
  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (application.status !== 'active') {
    return NextResponse.json({ error: 'Cannot withdraw a non-active application' }, { status: 400 });
  }

  await prisma.candidateApplication.update({
    where: { id },
    data: { status: 'withdrawn' },
  });

  return NextResponse.json({ success: true });
}
