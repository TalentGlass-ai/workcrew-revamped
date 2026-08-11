import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const prisma = await getPrisma();
    if (!prisma) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const { id } = await context.params;

    // Support full UUID or 8-char suffix (used by slug links: "company-name-abcd1234")
    const org = id.length === 8
      ? await prisma.organization.findFirst({
          where: { id: { endsWith: id } },
          include: {
            jobs: {
              where: { status: 'published' },
              select: { id: true, title: true, location: true, jobType: true, salaryMin: true, salaryMax: true, seoSlug: true, createdAt: true, _count: { select: { applications: true } } },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            _count: { select: { jobs: { where: { status: 'published' } } } },
          },
        })
      : await prisma.organization.findUnique({
          where: { id },
          include: {
            jobs: {
              where: { status: 'published' },
              select: { id: true, title: true, location: true, jobType: true, salaryMin: true, salaryMax: true, seoSlug: true, createdAt: true, _count: { select: { applications: true } } },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            _count: { select: { jobs: { where: { status: 'published' } } } },
          },
        });

    if (!org) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    return NextResponse.json({
      ...org,
      slug: `${org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${org.id.slice(-8)}`,
      jobs: org.jobs.map((job) => ({
        ...job,
        url: `/jobs/${job.seoSlug ?? job.id}`,
      })),
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
