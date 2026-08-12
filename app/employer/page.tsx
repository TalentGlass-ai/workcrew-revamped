"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "../components/NotificationBell";

type Job = {
  id: string;
  title: string;
  location: string | null;
  jobType: string | null;
  status: string;
  createdAt: string;
  _count: { applications: number };
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  published: { label: "Live", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  draft:     { label: "Draft", cls: "bg-gray-100 text-gray-600 ring-1 ring-gray-200" },
  closed:    { label: "Closed", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  archived:  { label: "Archived", cls: "bg-red-50 text-red-600 ring-1 ring-red-200" },
};

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

export default function EmployerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  // Track which button was clicked so FormData ambiguity is avoided
  const [publishIntent, setPublishIntent] = useState(false);

  async function load() {
    const res = await fetch("/api/employer/jobs");
    if (res.ok) setJobs((await res.json()).jobs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      location: fd.get("location") as string || undefined,
      jobType: fd.get("jobType") as string || undefined,
      salaryMin: fd.get("salaryMin") ? Number(fd.get("salaryMin")) : undefined,
      salaryMax: fd.get("salaryMax") ? Number(fd.get("salaryMax")) : undefined,
      publish: publishIntent,
    };
    const res = await fetch("/api/employer/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSubmitting(false);
    if (res.ok) { setShowForm(false); setPublishIntent(false); await load(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed to create job"); }
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/employer/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  const displayed = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const counts = { all: jobs.length, published: jobs.filter(j => j.status === "published").length, draft: jobs.filter(j => j.status === "draft").length, closed: jobs.filter(j => j.status === "closed").length };
  const totalApps = jobs.reduce((s, j) => s + j._count.applications, 0);

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="mt-0.5 text-sm text-gray-500">Manage your job postings and assessments</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/employer/analytics" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
                Analytics
              </Link>
              <Link href="/employer/team" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
                Team
              </Link>
              <Link href="/employer/messages" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
                Messages
              </Link>
              <Link href="/employer/saved-candidates" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
                ★ Saved
              </Link>
              <Link href="/employer/candidate-search" className="rounded-lg border border-[#4D31EC]/40 px-4 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                🔍 Candidates
              </Link>
              <Link href="/assessments" className="rounded-lg border border-[#4D31EC] px-4 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                Assessments
              </Link>
              <NotificationBell allHref="/employer/notifications" />
              <button onClick={() => { setShowForm(!showForm); setError(""); setPublishIntent(false); }}
                className="rounded-lg bg-[#4D31EC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                {showForm ? "Cancel" : "+ Post a Job"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Jobs", value: counts.all, color: "text-gray-900" },
              { label: "Live", value: counts.published, color: "text-emerald-600" },
              { label: "Draft", value: counts.draft, color: "text-gray-500" },
              { label: "Applications", value: totalApps, color: "text-[#4D31EC]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Job creation form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">New Job Posting</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input name="title" required placeholder="Job title *" className={INPUT} />
              <textarea name="description" required rows={4} placeholder="Job description *" className={`${INPUT} resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <input name="location" placeholder="Location (e.g. Remote, New York)" className={INPUT} />
                <select name="jobType" className={INPUT}>
                  <option value="">Job type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="salaryMin" type="number" placeholder="Salary min (USD)" className={INPUT} />
                <input name="salaryMax" type="number" placeholder="Salary max (USD)" className={INPUT} />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  onClick={() => setPublishIntent(false)}
                  className="rounded-lg border border-[#4D31EC] px-5 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 disabled:opacity-60 transition-colors">
                  Save as draft
                </button>
                <button type="submit" disabled={submitting}
                  onClick={() => setPublishIntent(true)}
                  className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
                  {submitting ? "Posting…" : "Publish now"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm w-fit">
          {(["all", "published", "draft", "closed"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === tab ? "bg-[#4D31EC] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}>
              {tab === "all" ? `All (${counts.all})` : tab === "published" ? `Live (${counts.published})` : `${tab.charAt(0).toUpperCase()}${tab.slice(1)} (${counts[tab as keyof typeof counts] ?? 0})`}
            </button>
          ))}
        </div>

        {/* Job list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <p className="text-lg font-medium text-gray-400">No jobs {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
            <p className="mt-1 text-sm text-gray-400">Post your first job to start receiving applications.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
              + Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((job) => {
              const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;
              return (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{job.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {[job.location, job.jobType].filter(Boolean).join(" · ")}
                      {" · "}{job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
                      {" · "}Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    <Link href={`/employer/jobs/${job.id}`}
                      className="text-xs font-semibold text-[#4D31EC] hover:underline">
                      Pipeline →
                    </Link>
                    {job.status === "draft" && (
                      <button onClick={() => setStatus(job.id, "published")}
                        className="text-xs font-semibold text-[#4D31EC] hover:underline">Publish</button>
                    )}
                    {job.status === "published" && (
                      <button onClick={() => setStatus(job.id, "closed")}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-700 hover:underline">Close</button>
                    )}
                    {job.status === "closed" && (
                      <button onClick={() => setStatus(job.id, "archived")}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-700 hover:underline">Archive</button>
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
