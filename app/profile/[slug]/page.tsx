"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Skill = { skillName: string; source: string | null; isValidated: boolean; score: number | null };

type CandidateProfile = {
  id: string;
  currentRole: string | null;
  location: string | null;
  profileSummary: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  user: { name: string | null };
  skills: Skill[];
};

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  assessment: { label: "Assessed",      cls: "bg-purple-50 text-purple-700" },
  resume:     { label: "Resume",        cls: "bg-blue-50 text-blue-700" },
  github:     { label: "GitHub",        cls: "bg-gray-100 text-gray-600" },
  self_reported: { label: "Self-reported", cls: "bg-gray-100 text-gray-400" },
};

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.candidate) setProfile(d.candidate); else setNotFound(true); });
  }, [slug]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">Profile not found</p>
          <p className="mt-2 text-sm text-gray-400">This profile doesn't exist or may have been removed.</p>
          <Link href="/find-jobs" className="mt-6 inline-block rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
            Browse jobs →
          </Link>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  const verified = profile.skills.filter(s => s.source && s.source !== "self_reported");
  const selfReported = profile.skills.filter(s => !s.source || s.source === "self_reported");
  const initials = (profile.user.name ?? "?")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">{profile.user.name ?? "Candidate"}</h1>
              {profile.currentRole && (
                <p className="mt-0.5 text-base text-white/80">{profile.currentRole}</p>
              )}
              {profile.location && (
                <p className="mt-0.5 text-sm text-white/60">📍 {profile.location}</p>
              )}
            </div>
          </div>

          {/* Social links */}
          <div className="mt-5 flex flex-wrap gap-3">
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25 transition-colors">
                LinkedIn ↗
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25 transition-colors">
                Portfolio ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Summary */}
        {profile.profileSummary && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">About</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profile.profileSummary}</p>
          </section>
        )}

        {/* Verified skills */}
        {verified.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Verified skills</h2>
            <div className="flex flex-wrap gap-2">
              {verified.map(s => {
                const badge = SOURCE_BADGE[s.source ?? ""] ?? SOURCE_BADGE.self_reported;
                return (
                  <div key={s.skillName}
                    className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
                    <span className="text-sm font-medium text-gray-800">{s.skillName}</span>
                    {s.isValidated && <span className="text-[10px] font-bold text-purple-600">✓</span>}
                    {s.score != null && (
                      <span className="text-[10px] font-semibold text-gray-500">{Math.round(s.score)}%</span>
                    )}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Self-reported skills */}
        {selfReported.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {selfReported.map(s => (
                <span key={s.skillName}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
                  {s.skillName}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.skills.length === 0 && !profile.profileSummary && (
          <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-400">This candidate hasn't filled out their profile yet.</p>
          </section>
        )}

        {/* CTA for recruiters */}
        <div className="rounded-2xl border border-[#4D31EC]/20 bg-[#4D31EC]/5 p-6 text-center">
          <p className="text-sm font-semibold text-gray-800">Interested in this candidate?</p>
          <p className="mt-0.5 text-xs text-gray-500">Post a job and they may apply, or reach them through WorkCrew.</p>
          <Link href="/employer"
            className="mt-4 inline-block rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
            Post a job on WorkCrew →
          </Link>
        </div>
      </div>
    </main>
  );
}
