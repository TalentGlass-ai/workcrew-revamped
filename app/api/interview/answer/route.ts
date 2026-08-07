import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewer, InterviewSession, interviewSessions } from '@/workcrew-ui/lib/aiInterviewer';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer } = await request.json();

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: 'Session ID and answer are required' },
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

    if (session.isComplete) {
      return NextResponse.json(
        { error: 'Interview is already complete' },
        { status: 400 }
      );
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'No current question available' },
        { status: 400 }
      );
    }

    // Evaluate the answer
    const evaluation = await aiInterviewer.evaluateAnswer(currentQuestion, answer);

    // Store the answer and evaluation
    session.answers.push(answer);
    session.evaluations.push(evaluation);
    session.updatedAt = new Date();

    // Determine next action
    let nextQuestion = null;
    let isComplete = false;
    let finalEvaluation = null;

    if (evaluation.followUpNeeded && session.currentQuestionIndex < session.questions.length - 1) {
      // Ask next question
      session.currentQuestionIndex++;
      nextQuestion = session.questions[session.currentQuestionIndex];
    } else if (session.currentQuestionIndex >= session.questions.length - 1) {
      // Interview complete
      isComplete = true;
      finalEvaluation = await aiInterviewer.generateFinalEvaluation(session);
      session.isComplete = true;
      session.finalEvaluation = finalEvaluation;
    } else {
      // Could ask next question anyway, or complete based on quality
      session.currentQuestionIndex++;
      nextQuestion = session.questions[session.currentQuestionIndex];
    }

    interviewSessions.set(sessionId, session);

    return NextResponse.json({
      evaluation,
      nextQuestion,
      isComplete,
      finalEvaluation,
      progress: {
        current: session.currentQuestionIndex + 1,
        total: session.questions.length
      }
    });

  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
}