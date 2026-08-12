import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getPrisma } from '../../../../../../lib/prisma';
import { can } from '../../../../../../lib/employerAuth';

// Returns { organizationId, role } for the signed-in employer, or null.
async function getOrgActor(): Promise<{ organizationId: string; role: string } | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const prisma = await getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { organizationId: true, role: true },
  });
  if (!user?.organizationId) return null;
  return { organizationId: user.organizationId, role: user.role };
}

// POST — create/replace proposal { slots: string[], meetingLink?, notes? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getOrgActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(actor.role, 'manageInterviews')) {
    return NextResponse.json({ error: 'Your role does not permit scheduling interviews' }, { status: 403 });
  }

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const { id: applicationId } = await params;
  const app = await prisma.candidateApplication.findFirst({
    where: { id: applicationId, job: { organizationId: actor.organizationId } },
    select: { id: true, candidate: { select: { userId: true, user: { select: { name: true } } } }, job: { select: { title: true } } },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { slots, meetingLink, notes } = await req.json();
  if (!Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json({ error: 'At least one slot required' }, { status: 400 });
  }

  const proposal = await prisma.interviewProposal.upsert({
    where: { applicationId },
    create: { applicationId, proposedSlots: slots, meetingLink: meetingLink ?? null, notes: notes ?? null, status: 'proposed' },
    update: { proposedSlots: slots, meetingLink: meetingLink ?? null, notes: notes ?? null, status: 'proposed', confirmedSlot: null },
  });

  // Notify candidate
  prisma.notification.create({
    data: {
      userId: app.candidate.userId,
      type: 'interview_proposed',
      title: 'Interview time slots proposed',
      body: `Pick a time for your ${app.job.title} interview.`,
      link: `/dashboard/applications/${applicationId}/schedule`,
    },
  }).catch(() => null);

  return NextResponse.json({ proposal });
}

// DELETE — cancel proposal
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getOrgActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(actor.role, 'manageInterviews')) {
    return NextResponse.json({ error: 'Your role does not permit cancelling interviews' }, { status: 403 });
  }

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const { id: applicationId } = await params;
  const app = await prisma.candidateApplication.findFirst({
    where: { id: applicationId, job: { organizationId: actor.organizationId } },
    select: { id: true },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.interviewProposal.deleteMany({ where: { applicationId } });
  return NextResponse.json({ ok: true });
}
