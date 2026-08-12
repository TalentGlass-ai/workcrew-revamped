import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getPrisma } from '../../../../../../lib/prisma';
import { can } from '../../../../../../lib/employerAuth';

const LANGUAGES = ['javascript', 'python', 'typescript'] as const;
type Language = typeof LANGUAGES[number];

// POST — recruiter requests a per-job AI interview from a candidate.
// Creates an `invited` AiInterview (no code yet); the candidate submits code to start.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { organizationId: true, role: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(user.role, 'managePipeline')) {
    return NextResponse.json({ error: 'Your role does not permit requesting interviews' }, { status: 403 });
  }

  const { id: jobId } = await params;
  const job = await prisma.job.findFirst({
    where: { id: jobId, organizationId: user.organizationId },
    select: { id: true, title: true, organization: { select: { name: true } } },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { candidateId, language = 'javascript' } = body as { candidateId?: string; language?: Language };
  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
  if (!LANGUAGES.includes(language)) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { user: { select: { id: true } } },
  });
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  // One open interview per candidate+job (invited or in progress)
  const existing = await prisma.aiInterview.findFirst({
    where: { candidateId, jobId, status: { in: ['invited', 'in_progress'] } },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: 'An AI interview is already pending for this candidate' }, { status: 409 });

  const interview = await prisma.aiInterview.create({
    data: {
      candidateId,
      jobId,
      language,
      status: 'invited',
      analysis: {},
      questions: [],
    },
    select: { id: true },
  });

  const candidateUserId = candidate.user?.id;
  if (candidateUserId) {
    prisma.notification.create({
      data: {
        userId: candidateUserId,
        type: 'ai_interview_requested',
        title: `AI interview requested by ${job.organization.name}`,
        body: `Complete a short AI technical interview for ${job.title}.`,
        link: `/ai-interviewer?invite=${interview.id}`,
      },
    }).catch(() => null);
  }

  return NextResponse.json({ interviewId: interview.id }, { status: 201 });
}
