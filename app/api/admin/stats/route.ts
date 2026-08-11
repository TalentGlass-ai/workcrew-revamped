import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const day30 = new Date(now.getTime() - 30 * 86_400_000);
  const day7  = new Date(now.getTime() -  7 * 86_400_000);

  const [
    totalUsers, newUsers30d,
    totalCandidates, totalOrgs,
    totalJobs, liveJobs,
    totalApplications, applications30d,
    totalHired, totalAssessments,
    recentUsers,
    jobsByStatus,
    appsByStage,
    dailySignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: day30 } } }),
    prisma.candidate.count(),
    prisma.organization.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'published' } }),
    prisma.candidateApplication.count(),
    prisma.candidateApplication.count({ where: { appliedAt: { gte: day30 } } }),
    prisma.candidateApplication.count({ where: { status: 'hired' } }),
    prisma.assessment.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true, organizationId: true },
    }),
    prisma.job.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.candidateApplication.groupBy({ by: ['currentStage'], _count: { id: true }, where: { status: 'active' } }),
    // Daily new users last 14 days
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT DATE("created_at") AS day, COUNT(*)::int AS count
      FROM users
      WHERE "created_at" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("created_at")
      ORDER BY day ASC
    `,
  ]);

  // Week-over-week application growth
  const apps7d  = await prisma.candidateApplication.count({ where: { appliedAt: { gte: day7 } } });
  const apps7d_prev = await prisma.candidateApplication.count({
    where: { appliedAt: { gte: new Date(day7.getTime() - 7 * 86_400_000), lt: day7 } },
  });
  const appGrowth = apps7d_prev > 0 ? Math.round(((apps7d - apps7d_prev) / apps7d_prev) * 100) : null;

  return NextResponse.json({
    summary: { totalUsers, newUsers30d, totalCandidates, totalOrgs, totalJobs, liveJobs, totalApplications, applications30d, totalHired, totalAssessments, apps7d, appGrowth },
    recentUsers,
    jobsByStatus,
    appsByStage,
    dailySignups,
  });
}
