import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

async function getCandidateId(userId: string) {
  const c = await prisma.candidate.findUnique({ where: { userId }, select: { id: true } });
  return c?.id ?? null;
}

// GET — candidate views the proposal for their application
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidateId = await getCandidateId(session.user.id);
  if (!candidateId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: applicationId } = await params;
  const app = await prisma.candidateApplication.findFirst({
    where: { id: applicationId, candidateId },
    select: {
      id: true,
      currentStage: true,
      job: { select: { title: true, organization: { select: { name: true } } } },
      interview: true,
    },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ application: app });
}

// PATCH — candidate confirms a slot { confirmedSlot: string }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidateId = await getCandidateId(session.user.id);
  if (!candidateId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: applicationId } = await params;
  const app = await prisma.candidateApplication.findFirst({
    where: { id: applicationId, candidateId },
    select: {
      id: true,
      jobId: true,
      interview: { select: { id: true, proposedSlots: true } },
      candidate: { select: { user: { select: { name: true } } } },
      job: { select: { title: true, createdBy: true } },
    },
  });
  if (!app?.interview) return NextResponse.json({ error: 'No proposal found' }, { status: 404 });

  const { confirmedSlot } = await req.json();
  const slots: string[] = Array.isArray(app.interview.proposedSlots) ? app.interview.proposedSlots as string[] : [];
  if (!slots.includes(confirmedSlot)) {
    return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
  }

  const updated = await prisma.interviewProposal.update({
    where: { id: app.interview.id },
    data: { confirmedSlot: new Date(confirmedSlot), status: 'confirmed' },
  });

  // Close the loop: notify the recruiter who created the job
  const when = new Date(confirmedSlot).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  prisma.notification.create({
    data: {
      userId: app.job.createdBy,
      type: 'interview_confirmed',
      title: 'Interview time confirmed',
      body: `${app.candidate.user.name ?? 'A candidate'} confirmed ${when} for ${app.job.title}.`,
      link: `/employer/jobs/${app.jobId}`,
    },
  }).catch(() => null);

  return NextResponse.json({ proposal: updated });
}
