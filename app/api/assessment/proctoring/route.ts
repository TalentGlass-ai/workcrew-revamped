import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PROCTORING_EVENTS = [
  'tab_switch',
  'window_blur',
  'right_click',
  'copy_attempt',
  'paste_attempt',
  'fullscreen_exit',
  'devtools_open',
  'keyboard_shortcut',
] as const;

type ProctoringEventType = typeof PROCTORING_EVENTS[number];

const schema = z.object({
  assessmentId: z.string().min(1),
  eventType: z.enum([...PROCTORING_EVENTS] as [string, ...string[]]),
  details: z.record(z.string(), z.unknown()).optional(),
});

// High-severity events that trigger a ProctoringFlag
const HIGH_SEVERITY_EVENTS = new Set(['tab_switch', 'devtools_open', 'fullscreen_exit']);
const MEDIUM_SEVERITY_EVENTS = new Set(['copy_attempt', 'paste_attempt']);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { assessmentId, eventType, details } = parsed.data;

  const candidate = await prisma.candidate.findFirst({
    where: { user: { email: session.user?.email! } },
  });
  if (!candidate) return NextResponse.json({ error: 'No candidate profile' }, { status: 403 });

  // Verify the candidate owns this assessment
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { candidateId: true },
  });
  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  if (assessment.candidateId !== candidate.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const severity = HIGH_SEVERITY_EVENTS.has(eventType)
    ? 'high'
    : MEDIUM_SEVERITY_EVENTS.has(eventType)
    ? 'medium'
    : 'low';

  const ops: any[] = [
    prisma.proctoringEvent.create({
      data: {
        assessmentId,
        candidateId: candidate.id,
        eventType,
        details: (details ?? {}) as any,
      },
    }),
  ];

  // Flag high/medium severity events
  if (severity !== 'low') {
    ops.push(
      prisma.proctoringFlag.create({
        data: {
          assessmentId,
          candidateId: candidate.id,
          reason: eventType.replace(/_/g, ' '),
          severity,
        },
      })
    );
  }

  await prisma.$transaction(ops);

  return NextResponse.json({ logged: true, severity });
}
