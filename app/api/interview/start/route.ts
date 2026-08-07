import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewer, InterviewSession, InterviewQuestion, interviewSessions } from '@/workcrew-ui/lib/aiInterviewer';

export async function POST(request: NextRequest) {
  try {
    const { candidateId, code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Analyze the code
    const codeAnalysis = await aiInterviewer.analyzeCode(code, language);

    // Generate follow-up questions
    const questions = await aiInterviewer.generateFollowUpQuestions(codeAnalysis);

    // Create interview session
    const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: InterviewSession = {
      id: sessionId,
      candidateId: candidateId || 'anonymous',
      codeSubmission: code,
      language,
      codeAnalysis,
      questions,
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      isComplete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    interviewSessions.set(sessionId, session);

    return NextResponse.json({
      sessionId,
      codeAnalysis,
      questions: questions.slice(0, 1), // Start with first question
      currentQuestionIndex: 0,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('Interview start error:', error);
    return NextResponse.json(
      { error: 'Failed to start interview' },
      { status: 500 }
    );
  }
}