import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

// GET /api/applications — list the signed-in candidate's applications
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!candidate) return NextResponse.json({ applications: [] });

  const applications = await prisma.candidateApplication.findMany({
    where: { candidateId: candidate.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          jobType: true,
          seoSlug: true,
          organization: { select: { name: true } },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return NextResponse.json({ applications });
}

// POST /api/applications — apply to a job
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await request.json();
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, status: true },
  });
  if (!job || job.status !== 'published') {
    return NextResponse.json({ error: 'Job not found or not open' }, { status: 404 });
  }

  const existing = await prisma.candidateApplication.findFirst({
    where: { jobId, candidateId: candidate.id },
  });
  if (existing) return NextResponse.json({ error: 'Already applied' }, { status: 409 });

  const application = await prisma.candidateApplication.create({
    data: {
      jobId,
      candidateId: candidate.id,
      currentStage: 'applied',
      status: 'active',
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
