import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Assessment Results – WorkCrew.ai" };

const SEVERITY_CLS: Record<string, string> = {
  high:   "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low:    "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
};

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: assessmentId } = await params;
  const { attemptId } = await searchParams;

  const role = (session.user as any)?.role ?? "candidate";
  const isRecruiter = role === "recruiter" || role === "admin";

  // Resolve attempt — use provided attemptId or find latest for this user
  let resolvedAttemptId = attemptId;
  if (!resolvedAttemptId) {
    if (isRecruiter) {
      const latest = await prisma.assessmentAttempt.findFirst({
        where: { assessmentId },
        orderBy: { startedAt: "desc" },
        select: { id: true },
      });
      resolvedAttemptId = latest?.id;
    } else {
      const candidate = await prisma.candidate.findFirst({
        where: { user: { email: session.user.email! } },
        select: { id: true },
      });
      const latest = candidate ? await prisma.assessmentAttempt.findFirst({
        where: { assessmentId, candidateId: candidate.id },
        orderBy: { startedAt: "desc" },
        select: { id: true },
      }) : null;
      resolvedAttemptId = latest?.id;
    }
  }

  if (!resolvedAttemptId) redirect("/assessments");

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: resolvedAttemptId },
    include: {
      assessment: {
        include: {
          questions: true,
          job: { select: { title: true } },
          candidate: { include: { user: { select: { name: true, email: true } } } },
          proctoringFlags: {
            orderBy: { flaggedAt: "desc" },
          },
        },
      },
      answers: {
        include: {
          question: { select: { questionType: true, questionText: true, weightage: true } },
        },
      },
    },
  });

  if (!attempt) redirect("/assessments");

  // Access check
  if (isRecruiter) {
    const recruiter = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { organizationId: true },
    });
    if (recruiter?.organizationId !== attempt.assessment.organizationId) redirect("/assessments");
  } else {
    const candidate = await prisma.candidate.findFirst({
      where: { user: { email: session.user.email! } },
      select: { id: true },
    });
    if (!candidate || candidate.id !== attempt.candidateId) redirect("/assessments");
  }

  const score = attempt.score ?? 0;
  const pct = Math.round(score);
  const passed = pct >= 60;
  const timeTaken = attempt.assessment.timeTaken;
  const mins = String(Math.floor(timeTaken / 60)).padStart(2, "0");
  const secs = String(timeTaken % 60).padStart(2, "0");
  const title = (attempt.assessment.report as any)?.title ?? "Skill Assessment";
  const flags = attempt.assessment.proctoringFlags;
  const unreviewedFlags = flags.filter(f => !f.reviewed);

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Assessment Results</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">{title}</h1>
              {attempt.assessment.job && (
                <p className="mt-0.5 text-sm text-gray-500">{attempt.assessment.job.title}</p>
              )}
              {isRecruiter && attempt.assessment.candidate && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {attempt.assessment.candidate.user.name ?? attempt.assessment.candidate.user.email}
                </p>
              )}
            </div>
            <Link href="/assessments" className="text-sm text-[#4D31EC] hover:underline whitespace-nowrap">
              ← All assessments
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Score hero */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className={`flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full text-3xl font-bold ${
            passed ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100" : "bg-red-50 text-red-500 ring-4 ring-red-100"
          }`}>
            {pct}%
          </div>
          <div className="text-center sm:text-left">
            <p className={`text-xl font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>
              {passed ? "Passed ✓" : "Not Passed"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {passed
                ? "Great work! This result has been recorded."
                : "Keep practising — you can improve your skills."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
              {[
                { label: "Score", value: `${pct}%` },
                { label: "Time", value: `${mins}:${secs}` },
                { label: "Questions", value: attempt.answers.length },
                { label: "Difficulty", value: attempt.assessment.difficulty },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 px-4 py-2 text-center">
                  <p className="text-base font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proctoring flags — recruiter only */}
        {isRecruiter && flags.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Integrity Flags
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {unreviewedFlags.length} unreviewed
                </span>
              </h2>
              {attempt.score !== null && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  attempt.fraudRiskScore != null && attempt.fraudRiskScore > 0.7
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : attempt.fraudRiskScore != null && attempt.fraudRiskScore > 0.3
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                }`}>
                  Risk: {attempt.fraudRiskScore != null ? `${Math.round(attempt.fraudRiskScore * 100)}%` : "N/A"}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 border border-amber-100">
                  <div>
                    <span className="text-sm font-medium text-gray-800 capitalize">{flag.reason}</span>
                    <span className="ml-2 text-xs text-gray-400">{new Date(flag.flaggedAt).toLocaleTimeString()}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_CLS[flag.severity] ?? ""}`}>
                    {flag.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-question answers */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Answers</h2>
          <div className="space-y-5">
            {attempt.answers.map((ans, i) => (
              <div key={ans.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Q{i + 1} · {ans.question.questionType} · weight {ans.question.weightage}
                    </p>
                    <p className="text-sm font-medium text-gray-800">{ans.question.questionText}</p>
                    <pre className={`mt-3 rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      ans.question.questionType === "coding"
                        ? "bg-gray-900 text-gray-100 font-mono"
                        : "bg-gray-50 text-gray-700 font-sans"
                    }`}>
                      {ans.answerText || <span className="opacity-40 italic">No answer provided</span>}
                    </pre>
                  </div>
                  {ans.score != null && (
                    <div className={`flex-shrink-0 rounded-full h-10 w-10 flex items-center justify-center text-xs font-bold ${
                      ans.score >= 70 ? "bg-emerald-50 text-emerald-700" :
                      ans.score >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                    }`}>
                      {Math.round(ans.score)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        <div className="pb-4">
          <Link href="/assessments"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
            ← Back to Assessments
          </Link>
        </div>
      </div>
    </main>
  );
}
