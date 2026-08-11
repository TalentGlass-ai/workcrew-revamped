import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

const PROFILE_SELECT = {
  id: true, resumeUrl: true, currentRole: true, location: true,
  profileSummary: true, linkedinUrl: true, portfolioUrl: true,
  githubUrl: true, totalExperience: true,
  currentCtc: true, expectedCtc: true, noticePeriod: true,
  user: { select: { name: true, email: true, phone: true, onboarded: true } },
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: PROFILE_SELECT,
  });

  if (!candidate) return NextResponse.json({ id: null, resumeUrl: null });

  const namePart = (candidate.user.name ?? 'candidate')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const suffix = candidate.id.slice(-8);
  const profileSlug = `${namePart}-${suffix}`;

  return NextResponse.json({ ...candidate, profileSlug });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, phone,
    currentRole, location, profileSummary,
    linkedinUrl, portfolioUrl, githubUrl,
    totalExperience, currentCtc, expectedCtc, noticePeriod,
  } = body;

  // Update User name/phone if provided
  if (name !== undefined || phone !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(phone !== undefined && { phone: String(phone).trim() || null }),
      },
    });
  }

  // Upsert Candidate record
  const candidate = await prisma.candidate.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      primarySkills: [],
      skillClusters: [],
      currentRole:     currentRole     ?? null,
      location:        location        ?? null,
      profileSummary:  profileSummary  ?? null,
      linkedinUrl:     linkedinUrl     ?? null,
      portfolioUrl:    portfolioUrl    ?? null,
      githubUrl:       githubUrl       ?? null,
      totalExperience: totalExperience != null ? Number(totalExperience) : null,
      currentCtc:      currentCtc      != null ? Number(currentCtc)      : null,
      expectedCtc:     expectedCtc     != null ? Number(expectedCtc)     : null,
      noticePeriod:    noticePeriod    != null ? Number(noticePeriod)    : null,
    },
    update: {
      ...(currentRole     !== undefined && { currentRole:     currentRole     || null }),
      ...(location        !== undefined && { location:        location        || null }),
      ...(profileSummary  !== undefined && { profileSummary:  profileSummary  || null }),
      ...(linkedinUrl     !== undefined && { linkedinUrl:     linkedinUrl     || null }),
      ...(portfolioUrl    !== undefined && { portfolioUrl:    portfolioUrl    || null }),
      ...(githubUrl       !== undefined && { githubUrl:       githubUrl       || null }),
      ...(totalExperience !== undefined && { totalExperience: totalExperience != null ? Number(totalExperience) : null }),
      ...(currentCtc      !== undefined && { currentCtc:      currentCtc      != null ? Number(currentCtc)      : null }),
      ...(expectedCtc     !== undefined && { expectedCtc:     expectedCtc     != null ? Number(expectedCtc)     : null }),
      ...(noticePeriod    !== undefined && { noticePeriod:    noticePeriod    != null ? Number(noticePeriod)    : null }),
    },
    select: PROFILE_SELECT,
  });

  return NextResponse.json(candidate);
}
