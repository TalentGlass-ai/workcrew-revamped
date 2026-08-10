import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const attemptId = searchParams.get('attemptId');
  if (!attemptId) return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          questions: true,
          job: { select: { title: true } },
        },
      },
      answers: {
        include: { question: { select: { questionType: true, questionText: true, weightage: true } } },
      },
    },
  });
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Access check: candidate who owns it, or recruiter in the same org
  const role = (session.user as any)?.role ?? 'candidate';
  if (role === 'recruiter' || role === 'admin') {
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      select: { organizationId: true },
    });
    if (user?.organizationId !== attempt.assessment.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else {
    const candidate = await prisma.candidate.findFirst({
      where: { user: { email: session.user?.email! } },
    });
    if (!candidate || candidate.id !== attempt.candidateId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json({ attempt });
}
