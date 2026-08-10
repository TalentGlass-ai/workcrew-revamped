import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { aiInterviewer, interviewSessions } from '@/workcrew-ui/lib/aiInterviewer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sessionId, answer } = await request.json();

    if (!sessionId || !answer) {
      return NextResponse.json({ error: 'Session ID and answer are required' }, { status: 400 });
    }

    // Load from cache or DB
    let session = interviewSessions.get(sessionId);
    if (!session) {
      const record = await prisma.aiInterview.findUnique({ where: { id: sessionId } });
      if (!record) return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
      session = {
        id: record.id,
        candidateId: record.candidateId,
        codeSubmission: record.code,
        language: record.language,
        codeAnalysis: record.analysis as any,
        questions: record.questions as any[],
        answers: record.answers as string[],
        evaluations: record.evaluations as any[],
        currentQuestionIndex: (record.answers as string[]).length,
        isComplete: record.status === 'completed',
        createdAt: record.startedAt,
        updatedAt: record.startedAt,
      };
      interviewSessions.set(sessionId, session);
    }

    if (session.isComplete) {
      return NextResponse.json({ error: 'Interview is already complete' }, { status: 400 });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json({ error: 'No current question available' }, { status: 400 });
    }

    const evaluation = await aiInterviewer.evaluateAnswer(currentQuestion, answer);

    session.answers.push(answer);
    session.evaluations.push(evaluation);
    session.updatedAt = new Date();

    let nextQuestion = null;
    let isComplete = false;
    let finalEvaluation = null;

    if (session.currentQuestionIndex >= session.questions.length - 1 || !evaluation.followUpNeeded) {
      if (session.currentQuestionIndex >= session.questions.length - 1) {
        isComplete = true;
        finalEvaluation = await aiInterviewer.generateFinalEvaluation(session);
        session.isComplete = true;
        session.finalEvaluation = finalEvaluation;

        const avgScore = session.evaluations.reduce((s: number, e: any) => s + e.score, 0) / session.evaluations.length;
        await prisma.aiInterview.update({
          where: { id: sessionId },
          data: {
            answers: session.answers as unknown as object[],
            evaluations: session.evaluations as object[],
            finalScore: avgScore,
            finalEval: finalEvaluation as object,
            status: 'completed',
            completedAt: new Date(),
          },
        });
      } else {
        session.currentQuestionIndex++;
        nextQuestion = session.questions[session.currentQuestionIndex];
        await prisma.aiInterview.update({
          where: { id: sessionId },
          data: { answers: session.answers as unknown as object[], evaluations: session.evaluations as object[] },
        });
      }
    } else {
      session.currentQuestionIndex++;
      nextQuestion = session.questions[session.currentQuestionIndex];
      await prisma.aiInterview.update({
        where: { id: sessionId },
        data: { answers: session.answers as unknown as object[], evaluations: session.evaluations as object[] },
      });
    }

    interviewSessions.set(sessionId, session);

    return NextResponse.json({
      evaluation,
      nextQuestion,
      isComplete,
      finalEvaluation,
      progress: {
        current: session.currentQuestionIndex + 1,
        total: session.questions.length,
      },
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}
