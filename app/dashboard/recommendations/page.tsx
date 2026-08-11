"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  seoSlug: string | null;
  matchScore: number;
  organization: { name: string; logo: string | null };
  _count: { applications: number };
};

function MatchBadge({ score }: { score: number }) {
  const cls = score >= 70
    ? "bg-emerald-50 text-emerald-700"
    : score >= 40
    ? "bg-amber-50 text-amber-700"
    : "bg-gray-100 text-gray-500";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${cls}`}>
      {score}% match
    </span>
  );
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [type, setType] = useState<string>("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/jobs/recommendations?limit=20")
      .then(r => r.ok ? r.json() : { jobs: [], type: "general" })
      .then(d => { setJobs(d.jobs ?? []); setType(d.type ?? "general"); })
      .finally(() => setLoading(false));
  }, [status]);

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
          <h1 className="text-2xl font-bold text-gray-900">Recommended Jobs</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {type === "personalized"
              ? "Ranked by how well they match your skills profile."
              : "Recent open roles — complete your skill profile to get personalised matches."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">No open jobs right now</p>
            <p className="mt-1 text-sm text-gray-400">Check back soon — new roles are added regularly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const jobUrl = job.seoSlug ? `/jobs/${job.seoSlug}` : `/jobs/${job.id}`;
              const sal = job.salaryMin && job.salaryMax
                ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k`
                : null;
              return (
                <div key={job.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                  <div className="min-w-0">
                    <Link href={jobUrl} className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-gray-500">{job.organization.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {[job.location, job.jobType, sal].filter(Boolean).join(" · ")}
                      {job._count.applications > 0 && ` · ${job._count.applications} applicant${job._count.applications !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <MatchBadge score={job.matchScore} />
                    <Link href={jobUrl}
                      className="rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {type === "general" && !loading && jobs.length > 0 && (
          <p className="mt-6 text-center text-xs text-gray-400">
            <Link href="/onboarding/personal-details" className="text-[#4D31EC] hover:underline">
              Complete your skill profile
            </Link>{" "}
            to get personalised rankings.
          </p>
        )}
      </div>
    </main>
  );
}
