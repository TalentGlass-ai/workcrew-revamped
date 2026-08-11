"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Application = {
  id: string;
  currentStage: string;
  status: string;
  aiMatchScore: number | null;
  appliedAt: string;
  candidate: {
    id: string;
    currentRole: string | null;
    location: string | null;
    primarySkills: string[] | Record<string, unknown>;
    fitScore: number | null;
    user: { name: string | null; email: string | null };
    assessments: { score: number | null; language: string }[];
  };
};

type Job = { id: string; title: string; status: string };

type SuggestedCandidate = {
  id: string;
  currentRole: string | null;
  location: string | null;
  primarySkills: string[] | Record<string, unknown>;
  matchScore: number;
  matchedSkills: string[];
  user: { name: string | null; email: string | null };
};

// ─── Stage config ────────────────────────────────────────────────────────────

const STAGES = [
  { key: "applied",   label: "Applied",   color: "border-blue-200 bg-blue-50",   dot: "bg-blue-400"   },
  { key: "screening", label: "Screening", color: "border-yellow-200 bg-yellow-50", dot: "bg-yellow-400" },
  { key: "interview", label: "Interview", color: "border-purple-200 bg-purple-50", dot: "bg-purple-400" },
  { key: "offer",     label: "Offer",     color: "border-emerald-200 bg-emerald-50", dot: "bg-emerald-400" },
  { key: "hired",     label: "Hired",     color: "border-emerald-300 bg-emerald-100", dot: "bg-emerald-600" },
  { key: "rejected",  label: "Rejected",  color: "border-red-200 bg-red-50",    dot: "bg-red-400"    },
] as const;

type StageKey = typeof STAGES[number]["key"];
const ADVANCE_TO: Partial<Record<StageKey, StageKey>> = {
  applied: "screening",
  screening: "interview",
  interview: "offer",
  offer: "hired",
};

// ─── Candidate card ───────────────────────────────────────────────────────────

function AssessForm({ jobId, candidateId, onSent }: { jobId: string; candidateId: string; onSent: () => void }) {
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      await fetch(`/api/employer/jobs/${jobId}/assign-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, language, difficulty }),
      });
      onSent();
    } finally {
      setSending(false);
    }
  };

  const sel = "rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#4D31EC]";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-[#4D31EC]/20 bg-[#4D31EC]/5 p-2">
      <select value={language} onChange={e => setLanguage(e.target.value)} className={sel}>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
      </select>
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={sel}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={send} disabled={sending}
        className="rounded-md bg-[#4D31EC] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors">
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}

function CandidateCard({
  app,
  jobId,
  onAction,
  busy,
}: {
  app: Application;
  jobId: string;
  onAction: (id: string, payload: { stage?: string; status?: string }) => void;
  busy: string | null;
}) {
  const [showAssess, setShowAssess] = useState(false);
  const [assessSent, setAssessSent] = useState(false);

  const skills: string[] = Array.isArray(app.candidate.primarySkills)
    ? (app.candidate.primarySkills as string[])
    : Object.keys(app.candidate.primarySkills ?? {});

  const assessment = app.candidate.assessments[0];
  const score = assessment?.score;
  const matchPct = app.aiMatchScore != null ? Math.round(app.aiMatchScore * 100) : null;
  const nextStage = ADVANCE_TO[app.currentStage as StageKey];
  const isBusy = busy === app.id;
  const isTerminal = app.status === "rejected" || app.status === "hired";
  const hasAssessment = assessment != null || assessSent;

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm text-sm ${isTerminal ? "opacity-60" : ""}`}>
      {/* Name + email */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <Link href={`/employer/candidates/${app.candidate.id}`}
            className="font-semibold text-gray-900 hover:text-[#4D31EC] truncate block transition-colors">
            {app.candidate.user.name ?? "—"}
          </Link>
          <p className="text-xs text-gray-400 truncate">{app.candidate.user.email}</p>
          {app.candidate.currentRole && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{app.candidate.currentRole}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {matchPct != null && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
              ${matchPct >= 70 ? "bg-emerald-50 text-emerald-700" : matchPct >= 40 ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
              {matchPct}% match
            </span>
          )}
          {score != null ? (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
              {Math.round(score)}% assessed
            </span>
          ) : assessSent || (assessment != null && score == null) ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
              Assessment pending
            </span>
          ) : null}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
          ))}
          {skills.length > 4 && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">+{skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Applied date */}
      <p className="text-xs text-gray-400 mb-3">
        Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>

      {/* Actions */}
      {!isTerminal && (
        <>
          <div className="flex gap-2">
            {nextStage && (
              <button
                onClick={() => onAction(app.id, { stage: nextStage })}
                disabled={isBusy}
                className="flex-1 rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors"
              >
                {isBusy ? "…" : `→ ${STAGES.find(s => s.key === nextStage)?.label}`}
              </button>
            )}
            {app.currentStage === "offer" && (
              <button
                onClick={() => onAction(app.id, { status: "hired" })}
                disabled={isBusy}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isBusy ? "…" : "Hire"}
              </button>
            )}
            {!hasAssessment && (
              <button
                onClick={() => setShowAssess(v => !v)}
                className="rounded-lg border border-[#4D31EC]/40 px-2 py-1.5 text-xs font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors"
                title="Send coding assessment"
              >
                📝
              </button>
            )}
            <button
              onClick={() => onAction(app.id, { status: "rejected" })}
              disabled={isBusy}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              ✕
            </button>
          </div>
          {showAssess && !hasAssessment && (
            <AssessForm
              jobId={jobId}
              candidateId={app.candidate.id}
              onSent={() => { setAssessSent(true); setShowAssess(false); }}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobPipelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [tab, setTab] = useState<"pipeline" | "suggested">("pipeline");
  const [suggested, setSuggested] = useState<SuggestedCandidate[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const load = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/employer/jobs/${jobId}/pipeline`)
      .then((r) => r.ok ? r.json() : { job: null, applications: [] })
      .then((d) => { setJob(d.job); setApplications(d.applications ?? []); })
      .finally(() => setLoading(false));
  }, [status, jobId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab !== "suggested" || suggested.length > 0 || status !== "authenticated") return;
    setSuggestedLoading(true);
    fetch(`/api/employer/jobs/${jobId}/recommended-candidates`)
      .then(r => r.ok ? r.json() : { candidates: [] })
      .then(d => setSuggested(d.candidates ?? []))
      .finally(() => setSuggestedLoading(false));
  }, [tab, jobId, status, suggested.length]);

  const handleAction = async (appId: string, payload: { stage?: string; status?: string }) => {
    setBusy(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) load();
    } finally {
      setBusy(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading pipeline…</p>
      </main>
    );
  }

  const active = applications.filter((a) => a.status === "active");
  const rejected = applications.filter((a) => a.status === "rejected");

  const byStage = (stageKey: string) => active.filter((a) => a.currentStage === stageKey);

  const activeStages = STAGES.filter((s) => s.key !== "rejected");

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Employer dashboard
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{job?.title ?? "Pipeline"}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {active.length} active · {applications.length} total applicants
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tab === "pipeline" && (
                <button
                  onClick={() => setShowRejected((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors
                    ${showRejected ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
                >
                  {showRejected ? "Hide" : "Show"} rejected ({rejected.length})
                </button>
              )}
              <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
                {(["pipeline", "suggested"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors
                      ${tab === t ? "bg-[#4D31EC] text-white" : "text-gray-500 hover:text-gray-800"}`}>
                    {t === "suggested" ? "✨ Suggested" : "Pipeline"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested candidates tab */}
      {tab === "suggested" && (
        <div className="mx-auto max-w-5xl px-6 py-6">
          {suggestedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : suggested.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <p className="text-gray-400">No matching candidates found.</p>
              <p className="mt-1 text-xs text-gray-400">Candidates appear here when their skills overlap with this job's requirements.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggested.map((c) => {
                const skills: string[] = Array.isArray(c.primarySkills)
                  ? c.primarySkills as string[]
                  : Object.keys(c.primarySkills ?? {});
                return (
                  <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/employer/candidates/${c.id}`}
                          className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                          {c.user.name ?? "—"}
                        </Link>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                          ${c.matchScore >= 70 ? "bg-emerald-50 text-emerald-700" : c.matchScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                          {c.matchScore}% match
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[c.currentRole, c.location].filter(Boolean).join(" · ")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.matchedSkills.slice(0, 5).map(s => (
                          <span key={s} className="rounded-md bg-[#4D31EC]/10 px-2 py-0.5 text-xs font-medium text-[#4D31EC]">{s}</span>
                        ))}
                        {skills.filter(s => !c.matchedSkills.includes(s)).slice(0, 3).map(s => (
                          <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{s}</span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/employer/candidates/${c.id}`}
                      className="flex-shrink-0 rounded-lg border border-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                      View profile
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pipeline board */}
      {tab === "pipeline" && (
      <div className="mx-auto max-w-7xl px-6 py-6 overflow-x-auto">
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-gray-400">No applications yet for this job.</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max pb-4">
            {activeStages.map((stage) => {
              const cards = byStage(stage.key);
              // Skip "hired" column if empty unless there are hired candidates
              const hiredApps = applications.filter((a) => a.status === "hired");
              if (stage.key === "hired") {
                if (hiredApps.length === 0) return null;
                return (
                  <div key={stage.key} className="w-64 flex-shrink-0">
                    <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${stage.color}`}>
                      <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                      <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                      <span className="ml-auto rounded-full bg-white/70 px-2 text-xs font-semibold text-gray-600">
                        {hiredApps.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {hiredApps.map((app) => (
                        <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={stage.key} className="w-64 flex-shrink-0">
                  <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${stage.color}`}>
                    <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                    <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                    <span className="ml-auto rounded-full bg-white/70 px-2 text-xs font-semibold text-gray-600">
                      {cards.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cards.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white/50 p-6 text-center">
                        <p className="text-xs text-gray-400">No candidates</p>
                      </div>
                    ) : (
                      cards.map((app) => (
                        <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Rejected column — toggled */}
            {showRejected && rejected.length > 0 && (
              <div className="w-64 flex-shrink-0">
                <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${STAGES.find(s => s.key === "rejected")!.color}`}>
                  <span className={`h-2 w-2 rounded-full ${STAGES.find(s => s.key === "rejected")!.dot}`} />
                  <span className="text-xs font-semibold text-gray-700">Rejected</span>
                  <span className="ml-auto rounded-full bg-white/70 px-2 text-xs font-semibold text-gray-600">
                    {rejected.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {rejected.map((app) => (
                    <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </main>
  );
}
