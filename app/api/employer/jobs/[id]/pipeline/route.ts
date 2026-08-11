import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getPrisma } from '../../../../../../lib/prisma';

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

  const { id: jobId } = await params;

  const job = await prisma.job.findFirst({
    where: { id: jobId, organizationId: user.organizationId },
    select: { id: true, title: true, status: true, description: true, location: true, jobType: true, salaryMin: true, salaryMax: true },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const applications = await prisma.candidateApplication.findMany({
    where: { jobId },
    orderBy: { appliedAt: 'asc' },
    include: {
      candidate: {
        select: {
          id: true,
          currentRole: true,
          location: true,
          primarySkills: true,
          fitScore: true,
          resumeUrl: true,
          user: { select: { name: true, email: true } },
          assessments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { score: true, language: true, difficulty: true, report: true },
          },
        },
      },
      interview: {
        select: { id: true, proposedSlots: true, confirmedSlot: true, status: true, meetingLink: true },
      },
    },
  });

  return NextResponse.json({ job, applications });
}
