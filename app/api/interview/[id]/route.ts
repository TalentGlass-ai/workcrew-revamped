import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const record = await prisma.aiInterview.findUnique({
    where: { id },
    include: { candidate: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const user = session.user as { id?: string; role?: string; organizationId?: string };

  // Candidate can only see their own
  if (user.role === 'candidate' && record.candidateId !== (await prisma.candidate.findUnique({ where: { userId: user.id } }))?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Recruiter can only see candidates in same org
  if (user.role === 'recruiter' || user.role === 'hiring_manager') {
    const candidateUser = await prisma.user.findUnique({ where: { id: record.candidate.userId } });
    if (candidateUser?.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json(record);
}
