import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getPrisma } from '../../../../../../lib/prisma';
import { sendEmail, emailTemplates } from '../../../../../../lib/email';
import { can } from '../../../../../../lib/employerAuth';

const LANGUAGES = ['javascript', 'python', 'typescript'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Language = typeof LANGUAGES[number];
type Difficulty = typeof DIFFICULTIES[number];

const DEFAULT_QUESTION: Record<Language, string> = {
  javascript: 'Write a function `solution(input)` that solves the problem described below. Your function should be efficient and handle edge cases.\n\nProblem: Given an array of integers, return the sum of all positive numbers.',
  typescript: 'Write a function `solution(input: number[]): number` that solves the problem described below.\n\nProblem: Given an array of integers, return the sum of all positive numbers.',
  python: 'Write a function `solution(input)` that solves the problem described below. Your function should be efficient and handle edge cases.\n\nProblem: Given a list of integers, return the sum of all positive numbers.',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    return NextResponse.json({ error: 'Your role does not permit assigning assessments' }, { status: 403 });
  }

  const { id: jobId } = await params;

  const job = await prisma.job.findFirst({
    where: { id: jobId, organizationId: user.organizationId },
    select: { id: true, title: true, organization: { select: { name: true } } },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { candidateId, language = 'javascript', difficulty = 'medium' } = body as {
    candidateId?: string;
    language?: Language;
    difficulty?: Difficulty;
  };

  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
  if (!LANGUAGES.includes(language)) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
  if (!DIFFICULTIES.includes(difficulty)) return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  // Prevent duplicate: one pending assessment per candidate+job
  const existing = await prisma.assessment.findFirst({
    where: { candidateId, jobId, score: null },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: 'Assessment already assigned' }, { status: 409 });

  const lang = language as Language;
  const assessment = await prisma.assessment.create({
    data: {
      organizationId: user.organizationId,
      candidateId,
      jobId,
      difficulty,
      language,
      timeTaken: 0,
      report: {
        title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Assessment`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      questions: {
        create: [{
          questionType: 'coding',
          questionText: DEFAULT_QUESTION[lang],
          weightage: 1,
        }],
      },
    },
    select: { id: true },
  });

  // Fire-and-forget: email + in-app notification
  const candidateUserId = candidate.user?.id;
  const email = candidate.user?.email;
  const tasks: Promise<any>[] = [];
  if (email) {
    const tpl = emailTemplates.assessmentAssigned(job.title, job.organization.name, assessment.id, language, difficulty);
    tasks.push(sendEmail(email, tpl.subject, tpl.html));
  }
  if (candidateUserId) {
    tasks.push(prisma.notification.create({
      data: {
        userId: candidateUserId,
        type: 'assessment_assigned',
        title: `New assessment from ${job.organization.name}`,
        body: `You've been assigned a ${difficulty} ${language} assessment for ${job.title}.`,
        link: `/assessments/${assessment.id}/take`,
      },
    }));
  }
  Promise.all(tasks).catch(() => null);

  return NextResponse.json({ assessmentId: assessment.id }, { status: 201 });
}
