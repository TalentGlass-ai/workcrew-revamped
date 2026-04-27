import { NextRequest, NextResponse } from 'next/server';
import { RealtimeInterviewOrchestrator } from '@/workcrew-ui/lib/orchestrator';

// Global orchestrator instance (in production, use proper dependency injection)
const orchestrator = new RealtimeInterviewOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const { language = 'javascript', mode = 'text' } = await request.json();

    const result = await orchestrator.startInterview(language, mode);

    return NextResponse.json({
      sessionId: result.sessionId,
      state: result.state,
      firstQuestion: result.firstQuestion,
      mode
    });
  } catch (error) {
    console.error('Failed to start real-time interview:', error);
    return NextResponse.json(
      { error: 'Failed to start interview' },
      { status: 500 }
    );
  }
}