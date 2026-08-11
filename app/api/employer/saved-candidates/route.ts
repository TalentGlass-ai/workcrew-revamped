import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';

async function getRecruiterUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const prisma = await getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true },
  });
  return user?.organizationId ? user.id : null;
}

// GET — list saved candidates for this recruiter
export async function GET() {
  const userId = await getRecruiterUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const rows = await prisma.savedCandidate.findMany({
    where: { userId },
    orderBy: { savedAt: 'desc' },
    select: {
      id: true,
      note: true,
      savedAt: true,
      candidate: {
        select: {
          id: true,
          currentRole: true,
          location: true,
          primarySkills: true,
          fitScore: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ saved: rows });
}

// POST — save a candidate  { candidateId, note? }
export async function POST(req: NextRequest) {
  const userId = await getRecruiterUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const { candidateId, note } = await req.json();
  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });

  const row = await prisma.savedCandidate.upsert({
    where: { userId_candidateId: { userId, candidateId } },
    create: { userId, candidateId, note: note ?? null },
    update: { note: note ?? undefined },
  });

  return NextResponse.json({ saved: row });
}

// DELETE — unsave  { candidateId }
export async function DELETE(req: NextRequest) {
  const userId = await getRecruiterUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const { candidateId } = await req.json();
  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });

  await prisma.savedCandidate.deleteMany({ where: { userId, candidateId } });
  return NextResponse.json({ ok: true });
}
