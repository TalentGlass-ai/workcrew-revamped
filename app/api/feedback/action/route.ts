// app/api/feedback/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { feedbackLearningEngine } from '../../../../lib/services/feedback-learning-engine';

// ActionType enum values
const VALID_ACTION_TYPES = ['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEWED', 'HIRED', 'IGNORED'] as const;
type ActionType = typeof VALID_ACTION_TYPES[number];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, jobId, actionType, metadata } = body;

    // Validate required fields
    if (!candidateId || !jobId || !actionType) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, jobId, actionType' },
        { status: 400 }
      );
    }

    // Validate action type
    if (!VALID_ACTION_TYPES.includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Record the action (this will trigger learning updates)
    await feedbackLearningEngine.recordAction({
      candidateId,
      jobId,
      recruiterId: session.user.id,
      actionType,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: 'Action recorded and learning updated'
    });

  } catch (error) {
    console.error('Feedback action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve learning insights (for debugging/admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as 'company' | 'recruiter' | 'system';
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing entityType or entityId query parameters' },
        { status: 400 }
      );
    }

    const weights = await feedbackLearningEngine.getPersonalizedWeights(entityType, entityId);

    return NextResponse.json({
      entityType,
      entityId,
      weights,
    });

  } catch (error) {
    console.error('Feedback insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}