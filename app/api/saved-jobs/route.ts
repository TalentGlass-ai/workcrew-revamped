import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: 'desc' },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          jobType: true,
          salaryMin: true,
          salaryMax: true,
          status: true,
          seoSlug: true,
          organization: { select: { name: true, logo: true } },
        },
      },
    },
  });

  return NextResponse.json({ saved });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await request.json().catch(() => ({}));
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  const saved = await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: session.user.id, jobId } },
    create: { userId: session.user.id, jobId },
    update: {},
    select: { id: true },
  });

  return NextResponse.json({ saved }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  await prisma.savedJob.deleteMany({
    where: { userId: session.user.id, jobId },
  });

  return NextResponse.json({ success: true });
}
