"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Profile = {
  id: string | null;
  currentRole: string | null;
  location: string | null;
  profileSummary: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  totalExperience: number | null;
  currentCtc: number | null;
  expectedCtc: number | null;
  noticePeriod: number | null;
  profileSlug: string | null;
  user: { name: string | null; email: string | null; phone: string | null } | null;
};

const INPUT = "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20 transition-all";
const LABEL = "mb-1 block text-xs font-semibold text-gray-600";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default function ProfileEditPage() {
  const { status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName]                   = useState("");
  const [phone, setPhone]                 = useState("");
  const [currentRole, setCurrentRole]     = useState("");
  const [location, setLocation]           = useState("");
  const [summary, setSummary]             = useState("");
  const [linkedin, setLinkedin]           = useState("");
  const [portfolio, setPortfolio]         = useState("");
  const [github, setGithub]               = useState("");
  const [experience, setExperience]       = useState("");
  const [currentCtc, setCurrentCtc]       = useState("");
  const [expectedCtc, setExpectedCtc]     = useState("");
  const [noticePeriod, setNoticePeriod]   = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/candidates/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: Profile | null) => {
        if (!d) return;
        setProfile(d);
        setName(d.user?.name ?? "");
        setPhone(d.user?.phone ?? "");
        setCurrentRole(d.currentRole ?? "");
        setLocation(d.location ?? "");
        setSummary(d.profileSummary ?? "");
        setLinkedin(d.linkedinUrl ?? "");
        setPortfolio(d.portfolioUrl ?? "");
        setGithub(d.githubUrl ?? "");
        setExperience(d.totalExperience != null ? String(d.totalExperience) : "");
        setCurrentCtc(d.currentCtc != null ? String(d.currentCtc) : "");
        setExpectedCtc(d.expectedCtc != null ? String(d.expectedCtc) : "");
        setNoticePeriod(d.noticePeriod != null ? String(d.noticePeriod) : "");
      })
      .finally(() => setLoading(false));
  }, [status]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch("/api/candidates/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        currentRole: currentRole.trim() || null,
        location: location.trim() || null,
        profileSummary: summary.trim() || null,
        linkedinUrl: linkedin.trim() || null,
        portfolioUrl: portfolio.trim() || null,
        githubUrl: github.trim() || null,
        totalExperience: experience !== "" ? Number(experience) : null,
        currentCtc:  currentCtc  !== "" ? Number(currentCtc)  : null,
        expectedCtc: expectedCtc !== "" ? Number(expectedCtc) : null,
        noticePeriod: noticePeriod !== "" ? Number(noticePeriod) : null,
      }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed to save"); }
  }

  if (status === "loading" || loading) return null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">Keep your profile up to date for better job matches.</p>
          {profile?.profileSlug && (
            <Link href={`/profile/${profile.profileSlug}`} target="_blank"
              className="mt-2 inline-block text-xs font-semibold text-[#4D31EC] hover:underline">
              View public profile ↗
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Personal */}
        <Section title="Personal information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Jane Smith" />
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input value={profile?.user?.email ?? ""} disabled
                className={`${INPUT} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
            <div>
              <label className={LABEL}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className={LABEL}>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className={INPUT} placeholder="New York, NY" />
            </div>
          </div>
        </Section>

        {/* Professional */}
        <Section title="Professional details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Current role / title</label>
              <input value={currentRole} onChange={e => setCurrentRole(e.target.value)} className={INPUT} placeholder="Senior Software Engineer" />
            </div>
            <div>
              <label className={LABEL}>Total experience (years)</label>
              <input type="number" min="0" step="0.5" value={experience} onChange={e => setExperience(e.target.value)}
                className={INPUT} placeholder="e.g. 4.5" />
            </div>
          </div>
          <div className="mt-4">
            <label className={LABEL}>Professional summary</label>
            <textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)}
              className={`${INPUT} resize-none`}
              placeholder="A brief summary of your experience, strengths, and career goals…" />
          </div>
        </Section>

        {/* Compensation & availability */}
        <Section title="Compensation & availability">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL}>Current CTC (USD / yr)</label>
              <input type="number" min="0" step="1000" value={currentCtc} onChange={e => setCurrentCtc(e.target.value)}
                className={INPUT} placeholder="e.g. 90000" />
            </div>
            <div>
              <label className={LABEL}>Expected CTC (USD / yr)</label>
              <input type="number" min="0" step="1000" value={expectedCtc} onChange={e => setExpectedCtc(e.target.value)}
                className={INPUT} placeholder="e.g. 110000" />
            </div>
            <div>
              <label className={LABEL}>Notice period (days)</label>
              <input type="number" min="0" step="1" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)}
                className={INPUT} placeholder="e.g. 30" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Compensation details are only visible to recruiters reviewing your application.</p>
        </Section>

        {/* Links */}
        <Section title="Links">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>LinkedIn</label>
              <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                className={INPUT} placeholder="https://linkedin.com/in/…" />
            </div>
            <div>
              <label className={LABEL}>Portfolio / website</label>
              <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)}
                className={INPUT} placeholder="https://…" />
            </div>
            <div>
              <label className={LABEL}>GitHub</label>
              <input type="url" value={github} onChange={e => setGithub(e.target.value)}
                className={INPUT} placeholder="https://github.com/…" />
            </div>
          </div>
        </Section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center gap-4 pb-8">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-[#4D31EC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <p className="text-sm font-medium text-emerald-600">Saved ✓</p>}
        </div>
      </form>
    </main>
  );
}
