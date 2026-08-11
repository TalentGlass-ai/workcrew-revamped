import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';

async function getRecruiter() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const prisma = await getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true, organization: { select: { subscriptionPlan: true, name: true } } },
  });
  return user?.organizationId ? user : null;
}

async function notifyAdmins(prisma: Awaited<ReturnType<typeof getPrisma>>, query: { skills?: string; location?: string; role?: string }, orgName: string) {
  if (!prisma) return;
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  const parts = [
    query.skills   ? `skills: ${query.skills}`     : null,
    query.location ? `location: ${query.location}` : null,
    query.role     ? `role: ${query.role}`          : null,
  ].filter(Boolean).join(', ');
  await prisma.notification.createMany({
    data: admins.map(a => ({
      userId: a.id,
      type: 'candidate_search_exhausted',
      title: 'Candidate search returned no results',
      body: `${orgName} searched for candidates (${parts || 'no filters'}) — database exhausted.`,
      link: '/admin',
    })),
    skipDuplicates: true,
  });
}

export async function GET(req: NextRequest) {
  const recruiter = await getRecruiter();
  if (!recruiter) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (recruiter.organization?.subscriptionPlan !== 'enterprise') {
    return NextResponse.json({ error: 'Enterprise plan required', upgrade: true }, { status: 403 });
  }

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const skills   = searchParams.get('skills')?.trim()   ?? '';
  const location = searchParams.get('location')?.trim() ?? '';
  const role     = searchParams.get('role')?.trim()     ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit    = 20;
  const skip     = (page - 1) * limit;

  const skillList = skills ? skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

  // Build filter: primarySkills overlap (JSON array contains), location, currentRole
  const where: Record<string, unknown> = {};
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (role)     where.currentRole = { contains: role, mode: 'insensitive' };

  const [total, candidates] = await Promise.all([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        currentRole: true,
        location: true,
        primarySkills: true,
        fitScore: true,
        profileSummary: true,
        user: { select: { name: true, email: true } },
        skills: {
          select: { skillName: true, isValidated: true, source: true },
          orderBy: [{ isValidated: 'desc' }, { skillName: 'asc' }],
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  // Filter by skills client-side on the result set (JSON array search in Postgres is cumbersome without extensions)
  const filtered = skillList.length === 0 ? candidates : candidates.filter(c => {
    const ps: string[] = Array.isArray(c.primarySkills) ? c.primarySkills as string[] : [];
    const skillNames = [...ps, ...c.skills.map(s => s.skillName)].map(s => s.toLowerCase());
    return skillList.some(s => skillNames.includes(s));
  });

  // Notify admins when database is exhausted (zero results for this search)
  if (filtered.length === 0 && (skills || location || role)) {
    notifyAdmins(prisma, { skills, location, role }, recruiter.organization?.name ?? 'Unknown org').catch(() => null);
  }

  return NextResponse.json({
    candidates: filtered,
    total: skillList.length ? filtered.length : total,
    page,
    pages: Math.ceil((skillList.length ? filtered.length : total) / limit),
  });
}
