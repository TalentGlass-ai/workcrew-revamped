import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { personalDetails, workExperience, professionalSummary } = await req.json();

  const firstName = personalDetails?.firstName?.trim() ?? '';
  const lastName = personalDetails?.lastName?.trim() ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || undefined;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboarded: true,
        ...(name ? { name, firstName, lastName } : {}),
        ...(personalDetails?.phone ? { phone: `${personalDetails.phoneCountry ?? ''}${personalDetails.phone}`.trim() } : {}),
      },
    }),
    prisma.candidate.upsert({
      where: { userId: session.user.id },
      update: {
        location: personalDetails?.location?.trim() || undefined,
        currentRole: workExperience?.title?.trim() || undefined,
        profileSummary: professionalSummary?.summary?.trim() || undefined,
        linkedinUrl: personalDetails?.linkedin?.trim() || undefined,
        portfolioUrl: personalDetails?.portfolio?.trim() || undefined,
      },
      create: {
        userId: session.user.id,
        location: personalDetails?.location?.trim() || null,
        currentRole: workExperience?.title?.trim() || null,
        profileSummary: professionalSummary?.summary?.trim() || null,
        linkedinUrl: personalDetails?.linkedin?.trim() || null,
        portfolioUrl: personalDetails?.portfolio?.trim() || null,
        primarySkills: [],
        skillClusters: [],
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
