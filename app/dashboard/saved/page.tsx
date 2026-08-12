"use client";

import Link from "next/link";
import { formatPay } from "../../../lib/pay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type SavedJob = {
  id: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    jobType: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    status: string;
    seoSlug: string | null;
    organization: { name: string; logo: string | null };
  };
};

export default function SavedJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/saved-jobs")
      .then(r => r.ok ? r.json() : { saved: [] })
      .then(d => setSaved(d.saved ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  const handleRemove = async (jobId: string) => {
    setRemoving(jobId);
    await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: "DELETE" });
    setSaved(prev => prev.filter(s => s.job.id !== jobId));
    setRemoving(null);
  };

  if (status === "loading") return null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading ? "" : `${saved.length} job${saved.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">No saved jobs yet</p>
            <p className="mt-1 text-sm text-gray-400">Bookmark jobs while browsing and they'll appear here.</p>
            <Link href="/jobs" className="mt-4 inline-block rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(({ id, savedAt, job }) => {
              const sal = (job.salaryMin || job.salaryMax) ? formatPay(job.salaryMin, job.salaryMax, job.currency) : null;
              const jobUrl = job.seoSlug ? `/jobs/${job.seoSlug}` : `/jobs/${job.id}`;
              const isClosed = job.status !== "published";
              return (
                <div key={id} className={`flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm ${isClosed ? "opacity-60" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={jobUrl} className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                        {job.title}
                      </Link>
                      {isClosed && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 capitalize">{job.status}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{job.organization.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {[job.location, job.jobType, sal].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                      Saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Link href={jobUrl}
                      className="rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(job.id)}
                      disabled={removing === job.id}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      {removing === job.id ? "…" : "Remove"}
                    </button>
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
