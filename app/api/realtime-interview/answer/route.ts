import { NextRequest, NextResponse } from 'next/server';
import { RealtimeInterviewOrchestrator } from '@/workcrew-ui/lib/orchestrator';

// Global orchestrator instance (in production, use proper dependency injection)
const orchestrator = new RealtimeInterviewOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer } = await request.json();

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: 'Session ID and answer are required' },
        { status: 400 }
      );
    }

    const result = await orchestrator.processAnswer(sessionId, answer);

    return NextResponse.json({
      evaluation: result.evaluation,
      nextQuestion: result.nextQuestion,
      isComplete: result.isComplete,
      state: result.state
    });
  } catch (error) {
    console.error('Failed to process answer:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
}