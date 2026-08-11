import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';

const STAGES = ['applied', 'screening', 'interview', 'offer', 'hired'] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [publishedJobs, applications] = await Promise.all([
    prisma.job.count({ where: { organizationId: user.organizationId, status: 'published' } }),
    prisma.candidateApplication.findMany({
      where: { job: { organizationId: user.organizationId } },
      select: {
        status: true,
        currentStage: true,
        appliedAt: true,
        job: { select: { id: true, title: true } },
      },
    }),
  ]);

  // Summary
  const total = applications.length;
  const active = applications.filter(a => a.status === 'active').length;
  const hired = applications.filter(a => a.status === 'hired').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;
  const withdrawn = applications.filter(a => a.status === 'withdrawn').length;

  // Pipeline distribution: active applications by currentStage + hired bucket
  const stageCounts = Object.fromEntries(STAGES.map(s => [s, 0])) as Record<string, number>;
  for (const a of applications) {
    if (a.status === 'active' && stageCounts[a.currentStage] !== undefined) {
      stageCounts[a.currentStage]++;
    } else if (a.status === 'hired') {
      stageCounts['hired']++;
    }
  }
  const funnel = STAGES.map(s => ({ stage: s, count: stageCounts[s] }));

  // Per-job breakdown
  const jobMap = new Map<string, { id: string; title: string; total: number; active: number; hired: number; rejected: number }>();
  for (const a of applications) {
    const key = a.job.id;
    if (!jobMap.has(key)) jobMap.set(key, { id: key, title: a.job.title, total: 0, active: 0, hired: 0, rejected: 0 });
    const row = jobMap.get(key)!;
    row.total++;
    if (a.status === 'active') row.active++;
    else if (a.status === 'hired') row.hired++;
    else if (a.status === 'rejected') row.rejected++;
  }
  const byJob = [...jobMap.values()].sort((a, b) => b.total - a.total);

  // Weekly application volume — last 8 weeks
  const now = Date.now();
  const weeks: { label: string; count: number }[] = Array.from({ length: 8 }, (_, i) => {
    const weekStart = now - (7 - i) * 7 * 86_400_000;
    const weekEnd = weekStart + 7 * 86_400_000;
    const d = new Date(weekStart);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = applications.filter(a => {
      const t = new Date(a.appliedAt).getTime();
      return t >= weekStart && t < weekEnd;
    }).length;
    return { label, count };
  });

  return NextResponse.json({
    summary: { publishedJobs, total, active, hired, rejected, withdrawn },
    funnel,
    byJob,
    weeks,
  });
}
