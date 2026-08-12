import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

// GET — the signed-in candidate's message threads (one per application with messages)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!candidate) return NextResponse.json({ threads: [] });

  const apps = await prisma.candidateApplication.findMany({
    where: { candidateId: candidate.id, messages: { some: {} } },
    select: {
      id: true,
      job: { select: { title: true, organization: { select: { name: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true, createdAt: true } },
    },
  });

  const unread = await prisma.message.groupBy({
    by: ['applicationId'],
    where: { application: { candidateId: candidate.id }, readAt: null, NOT: { senderId: session.user.id } },
    _count: true,
  });
  const unreadMap = new Map(unread.map(u => [u.applicationId, u._count]));

  const threads = apps
    .map(a => ({
      id: a.id,
      title: a.job.organization.name,
      subtitle: a.job.title,
      lastMessage: a.messages[0]?.body ?? '',
      lastAt: a.messages[0]?.createdAt ?? null,
      unread: unreadMap.get(a.id) ?? 0,
    }))
    .sort((x, y) => (y.lastAt?.getTime() ?? 0) - (x.lastAt?.getTime() ?? 0));

  return NextResponse.json({ threads });
}
