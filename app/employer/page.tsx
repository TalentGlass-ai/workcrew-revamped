"use client";

import React, { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  location: string | null;
  jobType: string | null;
  status: string;
  createdAt: string;
  _count: { applications: number };
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  closed: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-600",
};

export default function EmployerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/employer/jobs");
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs);
    }
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
      publish: fd.get("publish") === "true",
    };
    const res = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      await load();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to create job");
    }
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/employer/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: "#4D31EC" }}>Employer Dashboard</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5]"
          >
            {showForm ? "Cancel" : "+ Post a Job"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">New Job Posting</h2>
            <input name="title" required placeholder="Job title *" className="input" />
            <textarea name="description" required rows={4} placeholder="Job description *" className="input resize-none" />
            <div className="grid grid-cols-2 gap-4">
              <input name="location" placeholder="Location (e.g. Remote, New York)" className="input" />
              <select name="jobType" className="input">
                <option value="">Job type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="salaryMin" type="number" placeholder="Salary min (USD)" className="input" />
              <input name="salaryMax" type="number" placeholder="Salary max (USD)" className="input" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" name="publish" value="false" disabled={submitting}
                className="rounded-full border border-[#4D31EC] px-5 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 disabled:opacity-60">
                Save as draft
              </button>
              <button type="submit" name="publish" value="true" disabled={submitting}
                className="rounded-full bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60">
                {submitting ? "Posting…" : "Publish now"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading…</p>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
            <p className="text-lg">No jobs yet.</p>
            <p className="text-sm mt-1">Post your first job to start receiving applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm">
                <div>
                  <p className="font-semibold text-gray-800">{job.title}</p>
                  <p className="text-sm text-gray-500">
                    {[job.location, job.jobType].filter(Boolean).join(" · ")}
                    {" · "}{job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[job.status] ?? STATUS_COLORS.draft}`}>
                    {job.status}
                  </span>
                  {job.status === "draft" && (
                    <button onClick={() => setStatus(job.id, "published")}
                      className="text-xs font-semibold text-[#4D31EC] hover:underline">Publish</button>
                  )}
                  {job.status === "published" && (
                    <button onClick={() => setStatus(job.id, "closed")}
                      className="text-xs font-semibold text-gray-500 hover:underline">Close</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus { border-color: #4D31EC; }
      `}</style>
    </main>
  );
}
