"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useCallback, useRef } from "react";

type Question = {
  id: string;
  questionType: string;
  questionText: string;
  weightage: number;
};

type AssessmentMeta = {
  id: string;
  difficulty: string;
  language: string;
};

export default function TakeAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [consent, setConsent] = useState(true); // show consent before starting
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [meta, setMeta] = useState<AssessmentMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("Skill Assessment");
  const proctoring = useRef(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!meta || submitting) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [meta, submitting]);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  // Start assessment via new API — gets attemptId + questions (only after consent)
  useEffect(() => {
    if (status !== "authenticated" || consent) return;
    setLoading(true);
    fetch("/api/assessment/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId: id }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setAttemptId(d.attemptId);
        setQuestions(d.questions ?? []);
        setMeta(d.assessment);
        // Fetch title from existing route for display
        return fetch(`/api/assessments/${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.assessment?.report?.title) setTitle(data.assessment.report.title); });
      })
      .catch(() => setError("Failed to load assessment."))
      .finally(() => { setLoading(false); proctoring.current = true; });
  }, [id, status, consent]);

  // Proctoring event listeners + fullscreen enforcement
  useEffect(() => {
    if (!attemptId) return;

    function log(eventType: string) {
      if (!proctoring.current) return;
      fetch("/api/assessment/proctoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: id, eventType, details: { ts: Date.now() } }),
      }).catch(() => {});
    }

    // Request fullscreen when assessment begins
    document.documentElement.requestFullscreen?.().catch(() => {});

    const onVisibility = () => { if (document.hidden) log("tab_switch"); };
    const onBlur = () => log("window_blur");
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); log("right_click"); };
    const onCopy = () => log("copy_attempt");
    const onPaste = () => log("paste_attempt");
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) log("fullscreen_exit");
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        log("devtools_open");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown);
      document.exitFullscreen?.().catch(() => {});
    };
  }, [attemptId, id]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !questions.length) return;
    proctoring.current = false;
    document.exitFullscreen?.().catch(() => {});
    setSubmitting(true);

    const res = await fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        answers: questions.map(q => ({ questionId: q.id, answerText: answers[q.id] ?? "" })),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(`/assessments/${id}/results?attemptId=${attemptId}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Submission failed");
    }
  }, [attemptId, questions, answers, id, router]);

  if (status === "loading" || loading) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading assessment…</p></main>;
  }

  // Consent gate — shown before assessment begins
  if (consent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4D31EC]/10">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Before you begin</h1>
          <p className="mt-2 text-sm text-gray-500">
            This assessment uses integrity monitoring. By starting, you agree that the following will be recorded:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            {[
              "Tab switches and window focus changes",
              "Copy and paste actions",
              "Right-click attempts",
              "Browser DevTools opening",
              "Exiting fullscreen mode",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#4D31EC]">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-400">
            The assessment will open in fullscreen. Exiting fullscreen will be flagged. Your activity is only visible to the recruiter who assigned this assessment.
          </p>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={() => setConsent(false)}
            className="mt-6 w-full rounded-lg bg-[#4D31EC] py-3 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors"
          >
            I understand — Start Assessment
          </button>
          <button
            onClick={() => router.push("/assessments")}
            className="mt-2 w-full rounded-lg py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </main>
    );
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

  if (!meta || questions.length === 0) return null;

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const allAnswered = questions.every(q => (answers[q.id] ?? "").trim().length > 0);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400 capitalize">{meta.difficulty} · {meta.language}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-gray-500">{mins}:{secs}</span>
            <span className="text-xs text-gray-400">{current + 1} / {questions.length}</span>
          </div>
        </div>
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
                    placeholder={`// Write your ${meta.language} solution here\n`}
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
