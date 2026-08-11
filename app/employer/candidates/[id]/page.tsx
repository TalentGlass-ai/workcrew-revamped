"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type Skill = { skillName: string; category: string | null; score: number | null; source: string | null };
type Assessment = { id: string; language: string; difficulty: string; score: number | null; createdAt: string; job: { title: string } | null };
type Application = { id: string; currentStage: string; status: string; appliedAt: string; aiMatchScore: number | null; job: { id: string; title: string } };
type Candidate = {
  id: string;
  profileSummary: string | null;
  totalExperience: number | null;
  currentRole: string | null;
  location: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  fitScore: number | null;
  primarySkills: string[] | Record<string, unknown>;
  user: { name: string | null; email: string | null };
  skills: Skill[];
  assessments: Assessment[];
  applications: Application[];
};

const STAGE_BADGE: Record<string, string> = {
  applied:   "bg-blue-50 text-blue-700",
  screening: "bg-yellow-50 text-yellow-700",
  interview: "bg-purple-50 text-purple-700",
  offer:     "bg-emerald-50 text-emerald-700",
  hired:     "bg-emerald-100 text-emerald-800",
};
const STATUS_BADGE: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700",
  rejected:  "bg-red-50 text-red-600",
  hired:     "bg-emerald-100 text-emerald-800",
  withdrawn: "bg-gray-100 text-gray-500",
};

const SKILL_SOURCE_COLOR: Record<string, string> = {
  assessment: "bg-purple-50 text-purple-700",
  resume:     "bg-blue-50 text-blue-700",
  github:     "bg-gray-100 text-gray-700",
};

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
      {label} ↗
    </a>
  );
}

export default function CandidateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/employer/candidates/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setCandidate(d?.candidate ?? null))
      .finally(() => setLoading(false));
  }, [status, params.id]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading profile…</p>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Candidate not found.</p>
      </main>
    );
  }

  const skills: string[] = Array.isArray(candidate.primarySkills)
    ? candidate.primarySkills as string[]
    : Object.keys(candidate.primarySkills ?? {});

  const topApp = candidate.applications[0];

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            {topApp ? (
              <Link href={`/employer/jobs/${topApp.job.id}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← {topApp.job.title} pipeline
              </Link>
            ) : (
              <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Employer dashboard
              </Link>
            )}
          </div>

          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.user.name ?? "—"}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {[candidate.currentRole, candidate.location].filter(Boolean).join(" · ")}
              </p>
              {candidate.totalExperience != null && (
                <p className="mt-0.5 text-xs text-gray-400">{candidate.totalExperience} yr{candidate.totalExperience !== 1 ? "s" : ""} experience</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {candidate.resumeUrl && <ExternalLink href={candidate.resumeUrl} label="Resume" />}
              {candidate.linkedinUrl && <ExternalLink href={candidate.linkedinUrl} label="LinkedIn" />}
              {candidate.githubUrl && <ExternalLink href={candidate.githubUrl} label="GitHub" />}
              {candidate.portfolioUrl && <ExternalLink href={candidate.portfolioUrl} label="Portfolio" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {candidate.profileSummary && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">About</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{candidate.profileSummary}</p>
            </section>
          )}

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((s) => (
                  <span key={s.skillName}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${SKILL_SOURCE_COLOR[s.source ?? ""] ?? "bg-gray-100 text-gray-700"}`}>
                    {s.skillName}
                    {s.score != null && <span className="ml-1 opacity-60">{Math.round(s.score)}</span>}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Assessments */}
          {candidate.assessments.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Assessments</h2>
              <div className="space-y-3">
                {candidate.assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{a.language} · <span className="font-normal capitalize">{a.difficulty}</span></p>
                      {a.job && <p className="text-xs text-gray-400 mt-0.5">{a.job.title}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {a.score != null ? (
                        <p className={`text-lg font-bold ${a.score >= 70 ? "text-emerald-600" : a.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                          {Math.round(a.score)}%
                        </p>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">Pending</span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI scores */}
          {(candidate.fitScore != null || topApp?.aiMatchScore != null) && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">AI Scores</h2>
              <div className="space-y-2">
                {candidate.fitScore != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Fit score</span>
                    <span className="text-sm font-bold text-[#4D31EC]">{Math.round(candidate.fitScore * 100)}%</span>
                  </div>
                )}
                {topApp?.aiMatchScore != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Job match</span>
                    <span className="text-sm font-bold text-[#4D31EC]">{Math.round(topApp.aiMatchScore * 100)}%</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Primary skills quick view */}
          {skills.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 8).map(s => (
                  <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Application history */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Applications</h2>
            <div className="space-y-3">
              {candidate.applications.map((app) => (
                <div key={app.id}>
                  <Link href={`/employer/jobs/${app.job.id}`}
                    className="text-xs font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors line-clamp-1">
                    {app.job.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STAGE_BADGE[app.currentStage] ?? "bg-gray-100 text-gray-500"}`}>
                      {app.currentStage}
                    </span>
                    {app.status !== "active" && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_BADGE[app.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {app.status}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact</h2>
            <p className="text-sm text-gray-700 break-all">{candidate.user.email}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
