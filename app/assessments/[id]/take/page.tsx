"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";

type Question = {
  id: string;
  questionType: string;
  questionText: string;
  weightage: number;
};

type Assessment = {
  id: string;
  difficulty: string;
  language: string;
  report: { title?: string } | null;
  job: { title: string } | null;
  questions: Question[];
};

export default function TakeAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!assessment || result) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [assessment, result]);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/assessments/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setAssessment(d.assessment))
      .catch(() => setError("Assessment not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [id, status]);

  const handleSubmit = useCallback(async () => {
    if (!assessment) return;
    setSubmitting(true);
    const res = await fetch(`/api/assessments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: assessment.questions.map(q => ({ questionId: q.id, answerText: answers[q.id] ?? "" })),
      }),
    });
    setSubmitting(false);
    if (res.ok) { const d = await res.json(); setResult(d.result); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Submission failed"); }
  }, [assessment, answers, id]);

  if (status === "loading" || loading) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading assessment…</p></main>;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm max-w-md">
          <p className="text-lg font-semibold text-gray-800">Unable to load assessment</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button onClick={() => router.push("/assessments")} className="mt-4 rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5]">
            Back to Assessments
          </button>
        </div>
      </main>
    );
  }

  if (!assessment) return null;

  const title = (assessment.report as any)?.title ?? "Skill Assessment";
  const questions = assessment.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const allAnswered = questions.every(q => (answers[q.id] ?? "").trim().length > 0);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  // ── Results screen ───────────────────────────────────────────────────────
  if (result) {
    const pct = Math.round(result.percentage ?? 0);
    const passed = result.passed;
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {pct}%
            </div>
            <h1 className="text-xl font-bold text-gray-900">{passed ? "Assessment Passed! 🎉" : "Assessment Complete"}</h1>
            <p className="mt-2 text-sm text-gray-500">{result.feedback}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Score", value: `${pct}%` },
                { label: "Time", value: `${mins}:${secs}` },
                { label: "Questions", value: questions.length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 py-3">
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <button onClick={() => router.push("/dashboard")}
              className="mt-6 w-full rounded-lg bg-[#4D31EC] py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Take screen ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400">{assessment.job?.title} · {assessment.difficulty} · {assessment.language}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-gray-500">{mins}:{secs}</span>
            <span className="text-xs text-gray-400">{current + 1} / {questions.length}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-[#4D31EC] transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex gap-6">
          {/* Question navigator */}
          <div className="hidden w-40 flex-shrink-0 md:block">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Questions</p>
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                    i === current ? "bg-[#4D31EC] text-white" :
                    answers[questions[i].id]?.trim() ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
                    "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question area */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${
                  q.questionType === "coding" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                  q.questionType === "text" ? "bg-purple-50 text-purple-700 ring-purple-200" :
                  "bg-gray-50 text-gray-600 ring-gray-200"
                }`}>{q.questionType}</span>
                <span className="text-xs text-gray-400">Weight: {q.weightage}</span>
              </div>

              <h2 className="mt-3 text-base font-semibold text-gray-900 leading-relaxed">{q.questionText}</h2>

              <div className="mt-5">
                {q.questionType === "coding" ? (
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 resize-none transition-all"
                    rows={14}
                    placeholder={`// Write your ${assessment.language} solution here\n`}
                    value={answers[q.id] ?? ""}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    spellCheck={false}
                  />
                ) : (
                  <textarea
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 resize-none transition-all"
                    rows={8}
                    placeholder="Type your answer here…"
                    value={answers[q.id] ?? ""}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                ← Previous
              </button>

              <div className="flex items-center gap-3">
                {!isLast && (
                  <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                    className="rounded-lg border border-[#4D31EC] px-4 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                    Next →
                  </button>
                )}
                {(isLast || allAnswered) && (
                  <button onClick={handleSubmit} disabled={submitting || !allAnswered}
                    className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
                    {submitting ? "Submitting…" : "Submit Assessment"}
                  </button>
                )}
              </div>
            </div>

            {!allAnswered && isLast && (
              <p className="mt-2 text-center text-xs text-gray-400">Answer all questions to submit.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
