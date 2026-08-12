import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';

// GET — the org's message threads (one per application with messages)
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgMembers = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true },
  });
  const memberIds = orgMembers.map(m => m.id);

  const apps = await prisma.candidateApplication.findMany({
    where: { job: { organizationId: user.organizationId }, messages: { some: {} } },
    select: {
      id: true,
      job: { select: { title: true } },
      candidate: { select: { user: { select: { name: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true, createdAt: true } },
    },
  });

  const unread = await prisma.message.groupBy({
    by: ['applicationId'],
    where: { application: { job: { organizationId: user.organizationId } }, readAt: null, senderId: { notIn: memberIds } },
    _count: true,
  });
  const unreadMap = new Map(unread.map((u: { applicationId: string; _count: number }) => [u.applicationId, u._count]));

  const threads = apps
    .map((a: any) => ({
      id: a.id,
      title: a.candidate.user.name ?? 'Candidate',
      subtitle: a.job.title,
      lastMessage: a.messages[0]?.body ?? '',
      lastAt: a.messages[0]?.createdAt ?? null,
      unread: unreadMap.get(a.id) ?? 0,
    }))
    .sort((x: any, y: any) => (y.lastAt?.getTime() ?? 0) - (x.lastAt?.getTime() ?? 0));

  return NextResponse.json({ threads });
}
