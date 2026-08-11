import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';
import { sendEmail, emailTemplates } from '../../../../lib/email';

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

  // Fire-and-forget: email + in-app notification to the candidate
  prisma.candidateApplication.findUnique({
    where: { id },
    include: {
      candidate: { include: { user: { select: { id: true, email: true } } } },
      job: { include: { organization: { select: { name: true } } } },
    },
  }).then(async (full) => {
    if (!full) return;
    const userId = full.candidate?.user?.id;
    const email = full.candidate?.user?.email;
    const jobTitle = full.job?.title ?? 'the role';
    const company = full.job?.organization?.name ?? 'the company';

    const notifTitle =
      updated.status === 'hired' ? `You've been hired at ${company}!` :
      updated.status === 'rejected' ? `Application update from ${company}` :
      `Your application moved to ${updated.currentStage}`;
    const notifBody =
      updated.status === 'hired' ? `Congratulations! Your application for ${jobTitle} has been accepted.` :
      updated.status === 'rejected' ? `Your application for ${jobTitle} was not selected to move forward.` :
      `Your application for ${jobTitle} at ${company} has advanced to the ${updated.currentStage} stage.`;

    const tasks: Promise<any>[] = [];
    if (userId) {
      tasks.push(prisma.notification.create({
        data: { userId, type: updated.status === 'hired' ? 'hired' : updated.status === 'rejected' ? 'rejected' : 'stage_change', title: notifTitle, body: notifBody, link: '/dashboard/applications' },
      }));
    }
    if (email) {
      const tpl = emailTemplates.applicationStageChanged(jobTitle, company, updated.currentStage, updated.status);
      tasks.push(sendEmail(email, tpl.subject, tpl.html));
    }
    await Promise.all(tasks);
  }).catch(() => null);

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
