import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Slug format: "firstname-lastname-abc12345" (last segment = 8-char candidate id suffix)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parts = slug.split('-');
  const suffix = parts[parts.length - 1];

  if (!suffix || suffix.length !== 8) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: { endsWith: suffix } },
    select: {
      id: true,
      currentRole: true,
      location: true,
      profileSummary: true,
      linkedinUrl: true,
      portfolioUrl: true,
      user: { select: { name: true } },
      skills: {
        orderBy: [{ isValidated: 'desc' }, { score: 'desc' }],
        select: { skillName: true, source: true, isValidated: true, score: true },
      },
    },
  });

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ candidate });
}
