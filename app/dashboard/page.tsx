"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import NotificationBell from "../components/NotificationBell";

type Assessment = {
  id: string;
  difficulty: string;
  language: string;
  createdAt: string;
  report: { title?: string; status?: string } | null;
  job: { title: string } | null;
};

type RecommendedJob = {
  id: string;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  seoSlug: string | null;
  matchScore: number;
  organization: { name: string };
};

const QUICK_LINKS = [
  { href: "/find-jobs", label: "Find Jobs", desc: "Browse AI-matched roles tailored to your skills.", icon: "🔍" },
  { href: "/dashboard/applications", label: "My Applications", desc: "Track the status of every job you've applied to.", icon: "📋" },
  { href: "/dashboard/messages", label: "Messages", desc: "Chat with recruiters about your applications.", icon: "💬" },
  { href: "/dashboard/saved", label: "Saved Jobs", desc: "Jobs you've bookmarked while browsing.", icon: "🔖" },
  { href: "/dashboard/alerts", label: "Job Alerts", desc: "Get emailed when new jobs match your criteria.", icon: "🔔" },
  { href: "/dashboard/resume", label: "Resume", desc: "Upload or replace the resume recruiters see.", icon: "📄" },
  { href: "/dashboard/skills", label: "Skills", desc: "Add skills to power job recommendations and matching.", icon: "⚡" },
  { href: "/ai-interviewer", label: "AI Interview", desc: "Practice a technical interview with adaptive AI questions.", icon: "🤖" },
  { href: "/dashboard/profile", label: "Profile", desc: "Edit your public profile, CTC, and notice period.", icon: "👤" },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-red-50 text-red-600",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assLoading, setAssLoading] = useState(true);
  const [activeApps, setActiveApps] = useState<number | null>(null);
  const [recommended, setRecommended] = useState<RecommendedJob[]>([]);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/assessments?pending=true")
      .then((r) => r.ok ? r.json() : { assessments: [] })
      .then((d) => setAssessments(d.assessments ?? []))
      .finally(() => setAssLoading(false));
    fetch("/api/applications")
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => setActiveApps((d.applications ?? []).filter((a: any) => a.status === "active").length));
    fetch("/api/jobs/recommendations?limit=4")
      .then((r) => r.ok ? r.json() : { jobs: [] })
      .then((d) => setRecommended(d.jobs ?? []));
    fetch("/api/candidates/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.profileSlug) setProfileSlug(d.profileSlug);
        setOnboarded(d?.user?.onboarded ?? true);
      });
  }, [status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70">{greeting},</p>
            <h1 className="mt-1 text-3xl font-bold">{firstName} 👋</h1>
            <p className="mt-2 text-sm text-white/70">Here's what you can do today.</p>
          </div>
          <div className="mt-1 flex-shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        {/* Onboarding nudge */}
        {onboarded === false && (
          <Link href="/onboarding/personal-details"
            className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">👋</span>
              <div>
                <p className="font-semibold text-amber-900">Complete your profile</p>
                <p className="text-xs text-amber-700">Finish the setup wizard to unlock better job matches.</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-amber-900 flex-shrink-0">Continue →</span>
          </Link>
        )}

        {/* Public profile link */}
        {profileSlug && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#4D31EC]/10 text-lg">🔗</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Your public profile</p>
                <p className="text-xs text-gray-400 truncate">/profile/{profileSlug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/profile/${profileSlug}`); }}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors"
              >
                Copy link
              </button>
              <Link href={`/profile/${profileSlug}`} target="_blank"
                className="rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                View ↗
              </Link>
            </div>
          </div>
        )}

        {/* Active applications summary */}
        {activeApps !== null && activeApps > 0 && (
          <Link href="/dashboard/applications"
            className="flex items-center justify-between rounded-xl border border-[#4D31EC]/20 bg-[#4D31EC]/5 px-5 py-4 hover:bg-[#4D31EC]/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4D31EC]/10 text-lg">📋</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {activeApps} active application{activeApps !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-500">Track your pipeline stages</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-[#4D31EC]">View all →</span>
          </Link>
        )}

        {/* Recommended jobs */}
        {recommended.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Recommended for you</h2>
              <Link href="/dashboard/recommendations" className="text-xs font-semibold text-[#4D31EC] hover:underline">See all →</Link>
            </div>
            <div className="space-y-2">
              {recommended.map((job) => {
                const jobUrl = job.seoSlug ? `/jobs/${job.seoSlug}` : `/jobs/${job.id}`;
                const sal = job.salaryMin && job.salaryMax
                  ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k`
                  : null;
                return (
                  <Link key={job.id} href={jobUrl}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[job.organization.name, job.location, sal].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${job.matchScore >= 70 ? "bg-emerald-50 text-emerald-700" : job.matchScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {job.matchScore}% match
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Pending assessments */}
        {(assLoading || assessments.length > 0) && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Pending Assessments
                {!assLoading && assessments.length > 0 && (
                  <span className="ml-2 rounded-full bg-[#4D31EC] px-2 py-0.5 text-xs text-white">{assessments.length}</span>
                )}
              </h2>
              <Link href="/assessments" className="text-xs font-semibold text-[#4D31EC] hover:underline">View all →</Link>
            </div>

            {assLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{(a.report as any)?.title ?? "Skill Assessment"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {a.job?.title && `${a.job.title} · `}
                        <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${DIFFICULTY_COLOR[a.difficulty] ?? ""}`}>{a.difficulty}</span>
                        {" · "}{a.language}
                      </p>
                    </div>
                    <Link href={`/assessments/${a.id}/take`}
                      className="ml-4 rounded-lg bg-[#4D31EC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors flex-shrink-0">
                      Start →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Quick links */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">Quick Links</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map(({ href, label, desc, icon }) => (
              <Link key={href} href={href}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-[#4D31EC]/30 hover:shadow-md transition-all">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#4D31EC]/10 text-xl">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
