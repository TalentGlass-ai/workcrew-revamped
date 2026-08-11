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
    select: { id: true, title: true, requiredSkills: true },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const requiredSkills: string[] = Array.isArray(job.requiredSkills)
    ? job.requiredSkills as string[]
    : [];

  // Fetch candidates who haven't applied to this job
  const candidates = await prisma.candidate.findMany({
    where: {
      applications: { none: { jobId } },
    },
    include: {
      user: { select: { name: true, email: true } },
      skills: { select: { skillName: true, isValidated: true } },
    },
    take: 60,
  });

  const scored = candidates
    .map((c) => {
      const skillMap = new Map(c.skills.map(s => [s.skillName.toLowerCase(), s.isValidated]));
      const matched = requiredSkills.filter(s => skillMap.has(s.toLowerCase()));
      const weightedMatch = matched.reduce((sum, s) => sum + (skillMap.get(s.toLowerCase()) ? 1.5 : 1), 0);
      const maxWeight = requiredSkills.length * 1.5;
      const matchScore = requiredSkills.length
        ? Math.round((weightedMatch / maxWeight) * 100)
        : 0;
      return {
        id: c.id,
        currentRole: c.currentRole,
        location: c.location,
        fitScore: c.fitScore,
        primarySkills: c.primarySkills,
        user: c.user,
        matchScore,
        matchedSkills: matched,
      };
    })
    .filter(c => c.matchScore > 0 || requiredSkills.length === 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

  return NextResponse.json({ candidates: scored, jobTitle: job.title });
}
