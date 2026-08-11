import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true, resumeUrl: true, currentRole: true, location: true, user: { select: { name: true } } },
  });

  if (!candidate) return NextResponse.json({ id: null, resumeUrl: null });

  const namePart = (candidate.user.name ?? 'candidate')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const suffix = candidate.id.slice(-8);
  const profileSlug = `${namePart}-${suffix}`;

  return NextResponse.json({ ...candidate, profileSlug });
}
