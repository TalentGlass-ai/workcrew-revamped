import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

// Resolve the viewer and their relationship to the application.
async function resolve(applicationId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: 401 as const };

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, organizationId: true },
  });
  if (!me) return { error: 401 as const };

  const app = await prisma.candidateApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidate: { select: { userId: true, user: { select: { name: true } } } },
      job: { select: { title: true, createdBy: true, organizationId: true, organization: { select: { name: true } } } },
    },
  });
  if (!app) return { error: 404 as const };

  const candidateUserId = app.candidate.userId;
  const isCandidate = candidateUserId === me.id;
  const isEmployer = !!me.organizationId && me.organizationId === app.job.organizationId;
  if (!isCandidate && !isEmployer) return { error: 403 as const };

  return { me, app, candidateUserId, isCandidate, isEmployer };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await resolve(id);
  if ('error' in r) return NextResponse.json({ error: 'Denied' }, { status: r.error });
  const { me, app, candidateUserId, isCandidate } = r;

  // Mark messages coming from the other side as read
  await prisma.message.updateMany({
    where: isCandidate
      ? { applicationId: id, readAt: null, NOT: { senderId: candidateUserId } }
      : { applicationId: id, readAt: null, senderId: candidateUserId },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { applicationId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, body: true, createdAt: true, senderId: true, sender: { select: { name: true } } },
  });

  return NextResponse.json({
    viewer: isCandidate ? 'candidate' : 'employer',
    title: isCandidate ? app.job.organization.name : (app.candidate.user.name ?? 'Candidate'),
    subtitle: app.job.title,
    messages: messages.map(m => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      mine: m.senderId === me.id,
      senderName: m.sender.name ?? '—',
    })),
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await resolve(id);
  if ('error' in r) return NextResponse.json({ error: 'Denied' }, { status: r.error });
  const { me, app, candidateUserId, isCandidate } = r;

  const raw = await req.json().catch(() => ({}));
  const body = typeof raw.body === 'string' ? raw.body.trim() : '';
  if (!body) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const message = await prisma.message.create({
    data: { applicationId: id, senderId: me.id, body: body.slice(0, 2000) },
    select: { id: true, body: true, createdAt: true, senderId: true, sender: { select: { name: true } } },
  });

  // Notify the other side
  const recipientId = isCandidate ? app.job.createdBy : candidateUserId;
  const link = isCandidate ? `/employer/messages?app=${id}` : `/dashboard/messages?app=${id}`;
  prisma.notification.create({
    data: {
      userId: recipientId,
      type: 'new_message',
      title: `New message from ${me.name ?? 'someone'}`,
      body: body.slice(0, 140),
      link,
    },
  }).catch(() => null);

  return NextResponse.json({
    message: { id: message.id, body: message.body, createdAt: message.createdAt, mine: true, senderName: message.sender.name ?? '—' },
  }, { status: 201 });
}
