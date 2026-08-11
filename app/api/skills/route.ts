import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

async function getCandidate(userId: string) {
  return prisma.candidate.findUnique({
    where: { userId },
    select: { id: true, primarySkills: true },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await getCandidate(session.user.id);
  if (!candidate) return NextResponse.json({ skills: [] });

  const skills = await prisma.candidateSkill.findMany({
    where: { candidateId: candidate.id },
    orderBy: [{ isValidated: 'desc' }, { skillName: 'asc' }],
    select: { skillName: true, category: true, source: true, isValidated: true, score: true },
  });
  return NextResponse.json({ skills });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { skillName, category } = await req.json();
  if (!skillName || typeof skillName !== 'string' || !skillName.trim())
    return NextResponse.json({ error: 'skillName required' }, { status: 400 });

  const name = skillName.trim();

  let candidate = await getCandidate(session.user.id);
  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: { userId: session.user.id, primarySkills: [], skillClusters: [] },
      select: { id: true, primarySkills: true },
    });
  }

  await prisma.candidateSkill.upsert({
    where: { candidateId_skillName: { candidateId: candidate.id, skillName: name } },
    create: { candidateId: candidate.id, skillName: name, category: category ?? 'technical', source: 'self_reported' },
    update: {},
  });

  // Keep primarySkills JSON in sync
  const existing: string[] = Array.isArray(candidate.primarySkills) ? candidate.primarySkills as string[] : [];
  if (!existing.includes(name)) {
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { primarySkills: [...existing, name] },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { skillName } = await req.json();
  if (!skillName) return NextResponse.json({ error: 'skillName required' }, { status: 400 });

  const candidate = await getCandidate(session.user.id);
  if (!candidate) return NextResponse.json({ ok: true });

  await prisma.candidateSkill.deleteMany({
    where: { candidateId: candidate.id, skillName },
  });

  const existing: string[] = Array.isArray(candidate.primarySkills) ? candidate.primarySkills as string[] : [];
  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { primarySkills: existing.filter((s) => s !== skillName) },
  });

  return NextResponse.json({ ok: true });
}
