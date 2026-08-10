import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const alerts = await prisma.jobAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { query, location, jobType, skills = [], frequency = 'daily' } = body;

  if (!['daily', 'weekly'].includes(frequency)) {
    return NextResponse.json({ error: 'frequency must be "daily" or "weekly"' }, { status: 400 });
  }

  const alert = await prisma.jobAlert.create({
    data: {
      userId: session.user.id,
      query: query || null,
      location: location || null,
      jobType: jobType || null,
      skills: Array.isArray(skills) ? skills : [],
      frequency,
    },
  });

  return NextResponse.json({ alert }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.jobAlert.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.jobAlert.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
