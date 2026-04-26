import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId, eventType, details } = await request.json();

    if (!assessmentId || !eventType) {
      return NextResponse.json({ error: 'Assessment ID and event type required' }, { status: 400 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Verify assessment belongs to candidate
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Assessment not found or access denied' }, { status: 404 });
    }

    // Create proctoring event
    const event = await prisma.proctoringEvent.create({
      data: {
        assessmentId,
        candidateId: candidate.id,
        eventType,
        details,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
    });
  } catch (error) {
    console.error('Proctoring event error:', error);
    return NextResponse.json(
      { error: 'Failed to log proctoring event' },
      { status: 500 }
    );
  }
}