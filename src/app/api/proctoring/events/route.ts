import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/types/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, candidateId, eventType, details } = await request.json();

    if (!assessmentId || !candidateId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the proctoring event
    const event = await prisma.proctoringEvent.create({
      data: {
        assessmentId,
        candidateId,
        eventType,
        details: details || {},
      },
    });

    // Check for suspicious patterns and flag if needed
    const shouldFlag = checkForSuspiciousActivity(eventType, details);

    if (shouldFlag) {
      await prisma.proctoringFlag.create({
        data: {
          assessmentId,
          candidateId,
          reason: `Suspicious activity: ${eventType}`,
          severity: determineSeverity(eventType),
        },
      });
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error logging proctoring event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    let flags;
    if (assessmentId) {
      flags = await prisma.proctoringFlag.findMany({
        where: { assessmentId },
        include: {
          assessment: true,
          candidate: {
            select: { id: true, user: { select: { name: true, email: true } } }
          }
        },
        orderBy: { flaggedAt: 'desc' }
      });
    } else {
      flags = await prisma.proctoringFlag.findMany({
        include: {
          assessment: true,
          candidate: {
            select: { id: true, user: { select: { name: true, email: true } } }
          }
        },
        orderBy: { flaggedAt: 'desc' }
      });
    }

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching proctoring flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function checkForSuspiciousActivity(eventType: string, details?: any): boolean {
  // Simple heuristics for flagging
  switch (eventType) {
    case 'tab_switch':
      return true; // Always flag tab switches
    case 'right_click':
      return true; // Flag right-click attempts
    case 'copy_attempt':
      return true; // Flag copy attempts
    case 'paste_attempt':
      return true; // Flag paste attempts
    case 'fullscreen_exit':
      return true; // Flag fullscreen exits
    case 'rapid_keystrokes':
      return details?.rate > 10; // Flag if more than 10 chars per second
    default:
      return false;
  }
}

function determineSeverity(eventType: string): string {
  switch (eventType) {
    case 'tab_switch':
    case 'fullscreen_exit':
      return 'high';
    case 'right_click':
    case 'copy_attempt':
    case 'paste_attempt':
      return 'medium';
    case 'rapid_keystrokes':
      return 'low';
    default:
      return 'low';
  }
}