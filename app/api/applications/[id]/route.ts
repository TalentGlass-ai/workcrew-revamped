import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

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
