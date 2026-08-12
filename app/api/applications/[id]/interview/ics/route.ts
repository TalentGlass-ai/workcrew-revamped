import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { prisma } from '../../../../../../lib/prisma';

// GET — download an .ics calendar file for the confirmed interview.
// Authorized for the application's candidate or any member of the hiring org.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true },
  });
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const app = await prisma.candidateApplication.findUnique({
    where: { id },
    select: {
      candidate: { select: { userId: true } },
      job: { select: { title: true, organizationId: true, organization: { select: { name: true } } } },
      interview: { select: { confirmedSlot: true, meetingLink: true, notes: true, status: true } },
    },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isCandidate = app.candidate.userId === me.id;
  const isEmployer = !!me.organizationId && me.organizationId === app.job.organizationId;
  if (!isCandidate && !isEmployer) return NextResponse.json({ error: 'Denied' }, { status: 403 });

  if (!app.interview?.confirmedSlot || app.interview.status !== 'confirmed') {
    return NextResponse.json({ error: 'No confirmed interview' }, { status: 404 });
  }

  const start = new Date(app.interview.confirmedSlot);
  const end = new Date(start.getTime() + 30 * 60_000); // ponytail: 30-min default, no duration field on the proposal
  const summary = `Interview: ${app.job.title} at ${app.job.organization.name}`;
  const descParts = [app.interview.notes, app.interview.meetingLink].filter(Boolean);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WorkCrew.ai//Interview//EN',
    'BEGIN:VEVENT',
    `UID:${id}@workcrew.ai`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    ...(descParts.length ? [`DESCRIPTION:${escapeIcs(descParts.join(' — '))}`] : []),
    ...(app.interview.meetingLink ? [`LOCATION:${escapeIcs(app.interview.meetingLink)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="interview.ics"',
    },
  });
}

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
