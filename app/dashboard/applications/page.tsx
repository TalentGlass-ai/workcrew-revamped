"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

type Application = {
  id: string;
  status: string;
  currentStage: string;
  aiMatchScore: number | null;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    jobType: string | null;
    seoSlug: string | null;
    organization: { name: string };
  };
};

const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
};

const STAGE_COLORS: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700",
  screening: "bg-yellow-50 text-yellow-700",
  interview: "bg-purple-50 text-purple-700",
  offer: "bg-emerald-50 text-emerald-700",
  hired: "bg-emerald-100 text-emerald-800",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-gray-100 text-gray-600",
  rejected: "bg-red-50 text-red-600",
  hired: "bg-emerald-100 text-emerald-800",
  withdrawn: "bg-gray-100 text-gray-400",
};

const STAGES = ["applied", "screening", "interview", "offer", "hired"];

function StageTrack({ currentStage, status }: { currentStage: string; status: string }) {
  const done = status === "rejected" || status === "withdrawn";
  const activeIdx = STAGES.indexOf(currentStage);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STAGES.map((s, i) => {
        const past = i < activeIdx;
        const active = i === activeIdx && !done;
        return (
          <React.Fragment key={s}>
            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors
              ${active ? "bg-[#4D31EC] text-white" : past && !done ? "bg-[#4D31EC]/20 text-[#4D31EC]" : "bg-gray-100 text-gray-400"}`}>
              {past && !done ? "✓" : i + 1}
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${past && !done ? "bg-[#4D31EC]/30" : "bg-gray-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const load = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/applications")
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => setApplications(d.applications ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const withdraw = async (id: string) => {
    if (!confirm("Withdraw this application?")) return;
    setWithdrawing(id);
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } finally {
      setWithdrawing(null);
    }
  };

  const visible = applications.filter((a) => {
    if (filter === "active") return a.status === "active";
    if (filter === "closed") return a.status !== "active";
    return true;
  });

  const activeCount = applications.filter((a) => a.status === "active").length;

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading…</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white/90 transition-colors">← Dashboard</Link>
          <h1 className="mt-3 text-3xl font-bold">My Applications</h1>
          <p className="mt-1 text-sm text-white/70">
            {applications.length === 0
              ? "No applications yet."
              : `${activeCount} active · ${applications.length} total`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {(["all", "active", "closed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-colors
                ${filter === f ? "bg-[#4D31EC] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-[#4D31EC]/30"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-400 text-sm">No applications here.</p>
            <Link href="/find-jobs"
              className="mt-4 inline-block rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((app) => {
              const isClosed = app.status !== "active";
              const jobSlug = app.job.seoSlug ?? app.job.id;
              const appliedDate = new Date(app.appliedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              });

              return (
                <div key={app.id}
                  className={`rounded-xl border bg-white px-6 py-5 shadow-sm transition-opacity ${isClosed ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/jobs/${jobSlug}`}
                        className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors line-clamp-1">
                        {app.job.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {app.job.organization.name}
                        {app.job.location && ` · ${app.job.location}`}
                        {app.job.jobType && ` · ${app.job.jobType}`}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {app.status}
                      </span>
                      {app.aiMatchScore != null && (
                        <span className="text-xs text-gray-400">{Math.round(app.aiMatchScore * 100)}% match</span>
                      )}
                    </div>
                  </div>

                  {/* Stage track — only for active applications */}
                  {!isClosed && <StageTrack currentStage={app.currentStage} status={app.status} />}

                  {/* Stage label row */}
                  {!isClosed && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_COLORS[app.currentStage] ?? "bg-gray-100 text-gray-500"}`}>
                        {STAGE_LABELS[app.currentStage] ?? app.currentStage}
                      </span>
                      <span className="text-xs text-gray-400">Applied {appliedDate}</span>
                    </div>
                  )}

                  {isClosed && (
                    <p className="mt-2 text-xs text-gray-400">Applied {appliedDate}</p>
                  )}

                  {/* Withdraw */}
                  {app.status === "active" && (
                    <div className="mt-4 border-t border-gray-50 pt-3">
                      <button onClick={() => withdraw(app.id)}
                        disabled={withdrawing === app.id}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50">
                        {withdrawing === app.id ? "Withdrawing…" : "Withdraw application"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
