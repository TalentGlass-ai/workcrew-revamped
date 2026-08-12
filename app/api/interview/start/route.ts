import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { aiInterviewer, interviewSessions } from '@/workcrew-ui/lib/aiInterviewer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { candidateId, code, language, jobId, interviewId } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    const codeAnalysis = await aiInterviewer.analyzeCode(code, language);
    const questions = await aiInterviewer.generateFollowUpQuestions(codeAnalysis);

    let record;
    if (interviewId) {
      // Recruiter-initiated invite: fill in the existing invited record.
      const invited = await prisma.aiInterview.findUnique({ where: { id: interviewId }, select: { id: true, status: true, candidateId: true } });
      if (!invited) return NextResponse.json({ error: 'Interview invite not found' }, { status: 404 });
      // Only the invited candidate may start it.
      const caller = session.user?.id
        ? await prisma.candidate.findUnique({ where: { userId: session.user.id }, select: { id: true } })
        : null;
      if (!caller || caller.id !== invited.candidateId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (invited.status !== 'invited') return NextResponse.json({ error: 'Interview already started' }, { status: 409 });
      record = await prisma.aiInterview.update({
        where: { id: interviewId },
        data: { language, code, analysis: codeAnalysis as object, questions: questions as object, status: 'in_progress' },
      });
    } else {
      // Candidate-initiated practice run.
      record = await prisma.aiInterview.create({
        data: {
          candidateId: candidateId || session.user?.id || 'anonymous',
          jobId: jobId ?? null,
          language,
          code,
          analysis: codeAnalysis as object,
          questions: questions as object,
          status: 'in_progress',
        },
      });
    }

    // Keep in-memory cache for active session
    interviewSessions.set(record.id, {
      id: record.id,
      candidateId: record.candidateId,
      codeSubmission: code,
      language,
      codeAnalysis,
      questions,
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      isComplete: false,
      createdAt: record.startedAt,
      updatedAt: record.startedAt,
    });

    return NextResponse.json({
      sessionId: record.id,
      codeAnalysis,
      questions: questions.slice(0, 1),
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Interview start error:', error);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}
