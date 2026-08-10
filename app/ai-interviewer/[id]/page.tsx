import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AiInterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { id } = await params;
  const record = await prisma.aiInterview.findUnique({
    where: { id },
    include: { candidate: { include: { user: { select: { name: true, email: true, organizationId: true } } } } },
  });

  if (!record) notFound();

  const user = session.user as { id?: string; role?: string; organizationId?: string };

  // Access control
  const isRecruiter = user.role === 'recruiter' || user.role === 'hiring_manager' || user.role === 'admin';
  if (!isRecruiter) {
    const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
    if (record.candidateId !== candidate?.id) redirect('/ai-interviewer');
  } else {
    if (record.candidate.user.organizationId !== user.organizationId && user.role !== 'admin') {
      redirect('/dashboard');
    }
  }

  const analysis = record.analysis as any;
  const questions = record.questions as any[];
  const answers = record.answers as string[];
  const evaluations = record.evaluations as any[];
  const finalEval = record.finalEval as any;

  const getScoreColor = (score: number) =>
    score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Interview Results</h1>
            {isRecruiter && (
              <p className="text-sm text-gray-500 mt-1">
                Candidate: {record.candidate.user.name ?? record.candidate.user.email}
              </p>
            )}
          </div>
          <Link
            href={isRecruiter ? '/dashboard' : '/ai-interviewer'}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back
          </Link>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              record.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {record.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
          <span className="text-sm text-gray-500">
            Language: <strong>{record.language}</strong>
          </span>
          {record.finalScore != null && (
            <span className={`text-sm font-semibold ${getScoreColor(record.finalScore)}`}>
              Score: {record.finalScore.toFixed(1)}/10
            </span>
          )}
        </div>

        {/* Final evaluation */}
        {finalEval && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Overall Evaluation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                ['Communication', finalEval.communication],
                ['Problem Solving', finalEval.problemSolving],
                ['Technical Depth', finalEval.depthOfKnowledge],
                ['Confidence', finalEval.confidence],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <div className={`text-2xl font-bold ${getScoreColor(val as number)}`}>
                    {val}/10
                  </div>
                  <div className="text-sm text-gray-500">{label as string}</div>
                </div>
              ))}
            </div>
            {finalEval.insight && (
              <p className="text-gray-700 border-t pt-4">{finalEval.insight}</p>
            )}
            {finalEval.skillSignals?.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Skill Signals</h3>
                <div className="space-y-2">
                  {finalEval.skillSignals.map((skill: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        {skill.evidence?.length > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            {skill.evidence.join(' • ')}
                          </span>
                        )}
                      </div>
                      <span className={`font-semibold ${getScoreColor(skill.score / 10)}`}>
                        {skill.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code analysis */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Code Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-green-700 mb-2">Strengths</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                {(analysis.strengths ?? []).map((s: string, i: number) => (
                  <li key={i}>✓ {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-700 mb-2">Areas for Discussion</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                {(analysis.weaknesses ?? []).map((w: string, i: number) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Q&A transcript */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Interview Transcript</h2>
          {questions.map((q: any, i: number) => (
            <div key={i} className="border-l-4 border-indigo-200 pl-4 space-y-2">
              <p className="font-medium text-indigo-900">Q{i + 1}: {q.question}</p>
              {answers[i] ? (
                <>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{answers[i]}</p>
                  {evaluations[i] && (
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Score: <strong className={getScoreColor(evaluations[i].score)}>{evaluations[i].score}/10</strong></span>
                      <span>Depth: {evaluations[i].depth}/10</span>
                      <span>Clarity: {evaluations[i].clarity}/10</span>
                    </div>
                  )}
                  {evaluations[i]?.feedback && (
                    <p className="text-sm text-gray-600">{evaluations[i].feedback}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Not answered</p>
              )}
            </div>
          ))}
        </div>

        {/* Submitted code */}
        {isRecruiter && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-3">Submitted Code</h2>
            <pre className="text-sm bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {record.code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
