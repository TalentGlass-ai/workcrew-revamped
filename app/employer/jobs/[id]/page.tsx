"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { CURRENCIES, currencyForLocation } from "../../../../lib/pay";
import { can } from "../../../../lib/capabilities";

// ─── Types ───────────────────────────────────────────────────────────────────

type InterviewProposal = {
  id: string;
  proposedSlots: string[];
  confirmedSlot: string | null;
  status: string;
  meetingLink: string | null;
};

type Application = {
  id: string;
  currentStage: string;
  status: string;
  aiMatchScore: number | null;
  appliedAt: string;
  coverLetter: string | null;
  interview: InterviewProposal | null;
  candidate: {
    id: string;
    currentRole: string | null;
    location: string | null;
    primarySkills: string[] | Record<string, unknown>;
    fitScore: number | null;
    resumeUrl: string | null;
    user: { name: string | null; email: string | null };
    assessments: { score: number | null; language: string; difficulty: string; report: { title?: string; status?: string } | null }[];
    aiInterviews: { id: string; finalScore: number | null; language: string; status: string; completedAt: string | null }[];
  };
};

type Job = {
  id: string; title: string; status: string;
  description: string | null; location: string | null;
  jobType: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null;
};

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

function RequestInterviewForm({ jobId, candidateId, onSent }: { jobId: string; candidateId: string; onSent: () => void }) {
  const [language, setLanguage] = useState("javascript");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setSending(true);
    setError("");
    const res = await fetch(`/api/employer/jobs/${jobId}/request-ai-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, language }),
    }).catch(() => null);
    setSending(false);
    if (res && res.ok) onSent();
    else { const d = res ? await res.json().catch(() => ({})) : {}; setError(d.error ?? "Failed to send"); }
  };

  const sel = "rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#4D31EC]";
  return (
    <div className="mt-2 rounded-lg border border-[#4D31EC]/20 bg-[#4D31EC]/5 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <select value={language} onChange={e => setLanguage(e.target.value)} className={sel}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
        <button onClick={send} disabled={sending}
          className="rounded-md bg-[#4D31EC] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors">
          {sending ? "Sending…" : "Request interview"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function fmtSlot(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function ScheduleForm({ appId, jobId, existing, onDone }: {
  appId: string;
  jobId: string;
  existing: InterviewProposal | null;
  onDone: () => void;
}) {
  const [slots, setSlots] = useState<string[]>(
    existing?.proposedSlots?.length ? existing.proposedSlots : [""]
  );
  const [meetingLink, setMeetingLink] = useState(existing?.meetingLink ?? "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  function setSlot(i: number, v: string) {
    setSlots(prev => prev.map((s, idx) => idx === i ? v : s));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const valid = slots.filter(Boolean);
    if (!valid.length) return;
    setSaving(true);
    await fetch(`/api/employer/applications/${appId}/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: valid, meetingLink: meetingLink || null, notes: notes || null }),
    }).catch(() => null);
    setSaving(false);
    onDone();
  }

  async function cancel() {
    setCancelling(true);
    await fetch(`/api/employer/applications/${appId}/interview`, { method: "DELETE" }).catch(() => null);
    setCancelling(false);
    onDone();
  }

  const inp = "w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";
  return (
    <form onSubmit={submit} className="mt-2 rounded-lg border border-[#4D31EC]/20 bg-[#4D31EC]/5 p-3 space-y-2">
      <p className="text-xs font-semibold text-[#4D31EC]">Propose interview times</p>
      {slots.map((s, i) => (
        <input key={i} type="datetime-local" value={s} onChange={e => setSlot(i, e.target.value)} className={inp} required={i === 0} />
      ))}
      {slots.length < 3 && (
        <button type="button" onClick={() => setSlots(prev => [...prev, ""])}
          className="text-xs font-semibold text-[#4D31EC] hover:underline">
          + Add another slot
        </button>
      )}
      <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
        placeholder="Meeting link (optional)" className={inp} />
      <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Note to candidate (optional)" className={inp} />
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving}
          className="flex-1 rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors">
          {saving ? "Sending…" : "Send proposal"}
        </button>
        {existing && (
          <button type="button" onClick={cancel} disabled={cancelling}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors">
            {cancelling ? "…" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );
}

function CandidateCard({
  app,
  jobId,
  onAction,
  busy,
  saved,
  onToggleSave,
}: {
  app: Application;
  jobId: string;
  onAction: (id: string, payload: { stage?: string; status?: string; reload?: boolean }) => void;
  busy: string | null;
  saved: boolean;
  onToggleSave: (candidateId: string) => void;
}) {
  const [showAssess, setShowAssess] = useState(false);
  const [assessSent, setAssessSent] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [showRequestInterview, setShowRequestInterview] = useState(false);
  const [interviewRequested, setInterviewRequested] = useState(false);

  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canPipeline = can(role, "managePipeline");
  const canInterviews = can(role, "manageInterviews");

  const skills: string[] = Array.isArray(app.candidate.primarySkills)
    ? (app.candidate.primarySkills as string[])
    : Object.keys(app.candidate.primarySkills ?? {});

  const assessment = app.candidate.assessments[0];
  const score = assessment?.score;
  const aiInterview = app.candidate.aiInterviews[0];
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
          <div className="flex items-center gap-1.5">
            <Link href={`/employer/candidates/${app.candidate.id}`}
              className="font-semibold text-gray-900 hover:text-[#4D31EC] truncate transition-colors">
              {app.candidate.user.name ?? "—"}
            </Link>
            <button
              onClick={() => onToggleSave(app.candidate.id)}
              title={saved ? "Remove from saved" : "Save candidate"}
              className={`flex-shrink-0 text-base leading-none transition-colors ${saved ? "text-[#4D31EC]" : "text-gray-300 hover:text-[#4D31EC]"}`}
            >
              {saved ? "★" : "☆"}
            </button>
          </div>
          <p className="text-xs text-gray-400 truncate">{app.candidate.user.email}</p>
          {app.candidate.currentRole && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{app.candidate.currentRole}</p>
          )}
          {app.candidate.resumeUrl && (
            <a href={app.candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#4D31EC] hover:underline mt-0.5 inline-block">
              📄 Resume ↗
            </a>
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
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              score >= 70 ? "bg-emerald-50 text-emerald-700" :
              score >= 50 ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-600"
            }`}>
              {Math.round(score)}%
            </span>
          ) : assessSent || (assessment != null && score == null) ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
              ⏳ Pending
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

      {/* Applied date + interview status */}
      <p className="text-xs text-gray-400 mb-1">
        Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      {app.interview && (
        <div className={`mb-2 rounded-lg px-2 py-1 text-xs font-medium
          ${app.interview.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {app.interview.status === "confirmed" ? (
            <span className="flex items-center justify-between gap-2">
              <span>Interview: {fmtSlot(app.interview.confirmedSlot!)}</span>
              <a href={`/api/applications/${app.id}/interview/ics`} title="Add to calendar"
                className="flex-shrink-0 font-semibold hover:underline">📅</a>
            </span>
          ) : (
            `⏳ Awaiting confirmation (${app.interview.proposedSlots.length} slot${app.interview.proposedSlots.length !== 1 ? "s" : ""})`
          )}
        </div>
      )}

      {/* Cover letter */}
      {app.coverLetter && (
        <div className="mb-2">
          <button
            onClick={() => setShowCover(v => !v)}
            className="text-xs font-semibold text-[#4D31EC] hover:underline"
          >
            {showCover ? "Hide cover letter" : "✉️ Cover letter"}
          </button>
          {showCover && (
            <p className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 max-h-48 overflow-y-auto">
              {app.coverLetter}
            </p>
          )}
        </div>
      )}

      {/* AI interview (per-job) */}
      {aiInterview && aiInterview.status === "completed" && (
        <a href={`/ai-interviewer/${aiInterview.id}`} target="_blank" rel="noopener noreferrer"
          className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-[#4D31EC]/20 bg-[#4D31EC]/5 px-2 py-1 hover:bg-[#4D31EC]/10 transition-colors">
          <span className="text-xs font-medium text-[#4D31EC]">🤖 AI interview</span>
          <span className="flex items-center gap-1.5">
            {aiInterview.finalScore != null && (
              <span className={`text-xs font-semibold ${
                aiInterview.finalScore >= 8 ? "text-emerald-600" :
                aiInterview.finalScore >= 6 ? "text-amber-600" : "text-red-500"
              }`}>
                {aiInterview.finalScore.toFixed(1)}/10
              </span>
            )}
            <span className="text-xs font-semibold text-[#4D31EC]">View →</span>
          </span>
        </a>
      )}
      {aiInterview && aiInterview.status !== "completed" && (
        <div className="mb-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
          🤖 AI interview {aiInterview.status === "in_progress" ? "in progress" : "invited"}
        </div>
      )}

      {/* Assessment detail row */}
      {assessment && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {assessment.report?.title && (
            <span className="text-xs text-gray-500 truncate max-w-[120px]" title={assessment.report.title}>
              {assessment.report.title}
            </span>
          )}
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 font-medium">
            {assessment.language}
          </span>
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
            assessment.difficulty === "hard" ? "bg-red-50 text-red-600" :
            assessment.difficulty === "medium" ? "bg-amber-50 text-amber-600" :
            "bg-emerald-50 text-emerald-600"
          }`}>
            {assessment.difficulty}
          </span>
        </div>
      )}

      {/* Actions */}
      {!isTerminal && (
        <>
          <div className="flex gap-2">
            {nextStage && canPipeline && (
              <button
                onClick={() => onAction(app.id, { stage: nextStage })}
                disabled={isBusy}
                className="flex-1 rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors"
              >
                {isBusy ? "…" : `→ ${STAGES.find(s => s.key === nextStage)?.label}`}
              </button>
            )}
            {app.currentStage === "offer" && canPipeline && (
              <button
                onClick={() => onAction(app.id, { status: "hired" })}
                disabled={isBusy}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isBusy ? "…" : "Hire"}
              </button>
            )}
            {!hasAssessment && canPipeline && (
              <button
                onClick={() => setShowAssess(v => !v)}
                className="rounded-lg border border-[#4D31EC]/40 px-2 py-1.5 text-xs font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors"
                title="Send coding assessment"
              >
                📝
              </button>
            )}
            {canInterviews && (
              <button
                onClick={() => setShowSchedule(v => !v)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors
                  ${showSchedule ? "border-[#4D31EC]/40 bg-[#4D31EC]/5 text-[#4D31EC]" : "border-gray-200 text-gray-500 hover:border-[#4D31EC]/40 hover:text-[#4D31EC]"}`}
                title="Schedule interview"
              >
                📅
              </button>
            )}
            {canPipeline && !aiInterview && !interviewRequested && (
              <button
                onClick={() => setShowRequestInterview(v => !v)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors
                  ${showRequestInterview ? "border-[#4D31EC]/40 bg-[#4D31EC]/5 text-[#4D31EC]" : "border-gray-200 text-gray-500 hover:border-[#4D31EC]/40 hover:text-[#4D31EC]"}`}
                title="Request AI interview"
              >
                🤖
              </button>
            )}
            <Link
              href={`/employer/messages?app=${app.id}`}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors"
              title="Message candidate"
            >
              💬
            </Link>
            {canPipeline && (
              <button
                onClick={() => onAction(app.id, { status: "rejected" })}
                disabled={isBusy}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          {showAssess && !hasAssessment && (
            <AssessForm
              jobId={jobId}
              candidateId={app.candidate.id}
              onSent={() => { setAssessSent(true); setShowAssess(false); }}
            />
          )}
          {showSchedule && (
            <ScheduleForm
              appId={app.id}
              jobId={jobId}
              existing={app.interview}
              onDone={() => { setShowSchedule(false); onAction(app.id, { reload: true }); }}
            />
          )}
          {showRequestInterview && (
            <RequestInterviewForm
              jobId={jobId}
              candidateId={app.candidate.id}
              onSent={() => { setInterviewRequested(true); setShowRequestInterview(false); onAction(app.id, { reload: true }); }}
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
  const [showEdit, setShowEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  // Edit-form currency: derived from the location field until the recruiter picks one.
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editCurrencyTouched, setEditCurrencyTouched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const role = (session?.user as { role?: string } | undefined)?.role;
  const canJobs = can(role, "manageJobs");

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
    if (status !== "authenticated") return;
    fetch("/api/employer/saved-candidates")
      .then(r => r.ok ? r.json() : { saved: [] })
      .then(d => setSavedIds(new Set((d.saved ?? []).map((s: { candidate: { id: string } }) => s.candidate.id))));
  }, [status]);

  useEffect(() => {
    if (tab !== "suggested" || suggested.length > 0 || status !== "authenticated") return;
    setSuggestedLoading(true);
    fetch(`/api/employer/jobs/${jobId}/recommended-candidates`)
      .then(r => r.ok ? r.json() : { candidates: [] })
      .then(d => setSuggested(d.candidates ?? []))
      .finally(() => setSuggestedLoading(false));
  }, [tab, jobId, status, suggested.length]);

  const handleAction = async (appId: string, payload: { stage?: string; status?: string; reload?: boolean }) => {
    if (payload.reload) { load(); return; }
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

  async function toggleSave(candidateId: string) {
    const isSaved = savedIds.has(candidateId);
    setSavedIds(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(candidateId) : next.add(candidateId);
      return next;
    });
    await fetch("/api/employer/saved-candidates", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    }).catch(() => null);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      location: (fd.get("location") as string) || undefined,
      jobType: (fd.get("jobType") as string) || undefined,
      salaryMin: fd.get("salaryMin") ? Number(fd.get("salaryMin")) : null,
      salaryMax: fd.get("salaryMax") ? Number(fd.get("salaryMax")) : null,
      currency: (fd.get("currency") as string) || undefined,
    };
    const res = await fetch(`/api/employer/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditSaving(false);
    if (res.ok) { setShowEdit(false); load(); }
    else { const d = await res.json().catch(() => ({})); setEditError(d.error ?? "Failed to save"); }
  }

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
                {job?.location && ` · ${job.location}`}
                {job?.jobType && ` · ${job.jobType}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canJobs && (
                <button
                  onClick={() => { setShowEdit(v => { if (!v) { setEditCurrency(job?.currency ?? "USD"); setEditCurrencyTouched(false); } return !v; }); setEditError(""); }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors
                    ${showEdit ? "border-gray-300 bg-gray-100 text-gray-700" : "border-gray-200 bg-white text-gray-500 hover:border-[#4D31EC]/40 hover:text-[#4D31EC]"}`}
                >
                  {showEdit ? "Cancel edit" : "✏️ Edit job"}
                </button>
              )}
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

      {/* Edit form */}
      {showEdit && job && (
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Job title *</label>
                <input name="title" required defaultValue={job.title}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Description *</label>
                <textarea name="description" required rows={5} defaultValue={job.description ?? ""}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Location</label>
                  <input name="location" defaultValue={job.location ?? ""}
                    onChange={(e) => { if (!editCurrencyTouched) setEditCurrency(currencyForLocation(e.target.value)); }}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Job type</label>
                  <select name="jobType" defaultValue={job.jobType ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all">
                    <option value="">— select —</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Currency</label>
                  <select name="currency" value={editCurrency}
                    onChange={(e) => { setEditCurrency(e.target.value); setEditCurrencyTouched(true); }}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Salary min</label>
                  <input name="salaryMin" type="number" defaultValue={job.salaryMin ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Salary max</label>
                  <input name="salaryMax" type="number" defaultValue={job.salaryMax ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all" />
                </div>
              </div>
              {editError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{editError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={editSaving}
                  className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
                  {editSaving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <button
                      onClick={() => toggleSave(c.id)}
                      title={savedIds.has(c.id) ? "Remove from saved" : "Save candidate"}
                      className={`text-xl leading-none transition-colors ${savedIds.has(c.id) ? "text-[#4D31EC]" : "text-gray-300 hover:text-[#4D31EC]"}`}
                    >
                      {savedIds.has(c.id) ? "★" : "☆"}
                    </button>
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
                        <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} saved={savedIds.has(app.candidate.id)} onToggleSave={toggleSave} />
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
                        <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} saved={savedIds.has(app.candidate.id)} onToggleSave={toggleSave} />
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
                    <CandidateCard key={app.id} app={app} jobId={jobId} onAction={handleAction} busy={busy} saved={savedIds.has(app.candidate.id)} onToggleSave={toggleSave} />
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
