"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Assessment = {
  id: string;
  difficulty: string;
  language: string;
  createdAt: string;
  score: number | null;
  report: { title?: string; status?: string } | null;
  job: { title: string } | null;
  candidate?: { user: { name: string | null; email: string | null } };
  _count?: { assessmentAttempts: number };
  questions?: { id: string }[];
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  hard: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

const INPUT = "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

// ── Recruiter: create assessment form ────────────────────────────────────────
function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ candidateEmail: "", title: "", difficulty: "medium", language: "javascript", jobId: "" });
  const [questions, setQuestions] = useState([{ type: "coding", text: "", expectedAnswer: "", weight: 1 }]);

  function set(field: string, val: string) { setForm(f => ({ ...f, [field]: val })); }
  function setQ(i: number, field: string, val: string | number) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  }
  function addQuestion() { setQuestions(qs => [...qs, { type: "coding", text: "", expectedAnswer: "", weight: 1 }]); }
  function removeQuestion(i: number) { setQuestions(qs => qs.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, questions }),
    });
    setLoading(false);
    if (res.ok) { setOpen(false); setForm({ candidateEmail: "", title: "", difficulty: "medium", language: "javascript", jobId: "" }); setQuestions([{ type: "coding", text: "", expectedAnswer: "", weight: 1 }]); onCreated(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed to create"); }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="rounded-lg bg-[#4D31EC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
      + New Assessment
    </button>
  );

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">New Assessment</h2>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Assessment title *</label>
            <input className={INPUT} placeholder="Backend Engineering Assessment" value={form.title} onChange={e => set("title", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Candidate email *</label>
            <input type="email" className={INPUT} placeholder="candidate@example.com" value={form.candidateEmail} onChange={e => set("candidateEmail", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Difficulty</label>
            <select className={INPUT} value={form.difficulty} onChange={e => set("difficulty", e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Language</label>
            <select className={INPUT} value={form.language} onChange={e => set("language", e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Questions ({questions.length})</label>
            {questions.length < 10 && (
              <button type="button" onClick={addQuestion} className="text-xs font-semibold text-[#4D31EC] hover:underline">+ Add question</button>
            )}
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Question {i + 1}</span>
                  {questions.length > 1 && <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-red-500 hover:underline">Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select className={INPUT} value={q.type} onChange={e => setQ(i, "type", e.target.value)}>
                    <option value="coding">Coding</option>
                    <option value="text">Open text</option>
                    <option value="multiple_choice">Multiple choice</option>
                  </select>
                  <input type="number" min={1} max={10} className={INPUT} placeholder="Weight (1–10)" value={q.weight} onChange={e => setQ(i, "weight", Number(e.target.value))} />
                </div>
                <textarea className={`${INPUT} resize-none`} rows={2} placeholder="Question text *" value={q.text} onChange={e => setQ(i, "text", e.target.value)} required />
                {q.type !== "coding" && (
                  <input className={INPUT} placeholder="Expected answer (optional)" value={q.expectedAnswer} onChange={e => setQ(i, "expectedAnswer", e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
          {loading ? "Creating…" : "Create & Assign"}
        </button>
      </form>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AssessmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  async function load() {
    const res = await fetch("/api/assessments");
    if (res.ok) setAssessments((await res.json()).assessments ?? []);
    setLoading(false);
  }

  useEffect(() => { if (status === "authenticated") load(); }, [status]);

  if (status === "loading") return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading…</p></main>;

  const role = (session?.user as any)?.role ?? "candidate";
  const isRecruiter = role === "recruiter" || role === "admin";

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {isRecruiter ? "Manage skill assessments for your candidates" : "Your assigned skill assessments"}
              </p>
            </div>
            {isRecruiter && <CreateForm onCreated={load} />}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : assessments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <p className="text-lg font-medium text-gray-400">No assessments yet</p>
            <p className="mt-1 text-sm text-gray-400">
              {isRecruiter ? "Create your first assessment to evaluate candidates." : "You have no pending assessments."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => {
              const title = (a.report as any)?.title ?? "Skill Assessment";
              const isPending = a.score === null;
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {isRecruiter && a.candidate?.user.name && `${a.candidate.user.name} · `}
                      {a.job?.title && `${a.job.title} · `}
                      <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${DIFFICULTY_COLOR[a.difficulty] ?? ""}`}>{a.difficulty}</span>
                      {" · "}{a.language}
                      {" · "}{new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                    {!isRecruiter && isPending ? (
                      <Link href={`/assessments/${a.id}/take`}
                        className="rounded-lg bg-[#4D31EC] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                        Start →
                      </Link>
                    ) : (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPending ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
                        {isPending ? "Pending" : `Score: ${Math.round(a.score ?? 0)}%`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
