import { NextRequest, NextResponse } from 'next/server';
import { InterviewSession } from '@/lib/aiInterviewer';
import { interviewSessions } from '@/lib/interviewStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = interviewSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      isComplete: session.isComplete,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      progress: {
        current: session.currentQuestionIndex + 1,
        total: session.questions.length
      },
      currentQuestion: session.isComplete ? null : session.questions[session.currentQuestionIndex],
      finalEvaluation: session.finalEvaluation
    });

  } catch (error) {
    console.error('Interview status error:', error);
    return NextResponse.json(
      { error: 'Failed to get interview status' },
      { status: 500 }
    );
  }
}