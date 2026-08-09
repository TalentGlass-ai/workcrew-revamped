"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Assessment = {
  id: string;
  difficulty: string;
  language: string;
  createdAt: string;
  report: { title?: string; status?: string } | null;
  job: { title: string } | null;
};

const QUICK_LINKS = [
  { href: "/find-jobs", label: "Find Jobs", desc: "Browse AI-matched roles tailored to your skills.", icon: "🔍" },
  { href: "/onboarding/personal-details", label: "Update Profile", desc: "Keep your personal details and resume up to date.", icon: "✏️" },
  { href: "/onboarding/upload-resume", label: "Upload Resume", desc: "Re-parse a new resume to refresh your profile.", icon: "📄" },
  { href: "/ai-interviewer", label: "AI Mock Interview", desc: "Practice for your next interview with our AI coach.", icon: "🎙️" },
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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/assessments?pending=true")
      .then((r) => r.ok ? r.json() : { assessments: [] })
      .then((d) => setAssessments(d.assessments ?? []))
      .finally(() => setAssLoading(false));
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
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-white/70">{greeting},</p>
          <h1 className="mt-1 text-3xl font-bold">{firstName} 👋</h1>
          <p className="mt-2 text-sm text-white/70">Here's what you can do today.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
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
