"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Candidate = {
  id: string;
  currentRole: string | null;
  location: string | null;
  primarySkills: string[] | Record<string, unknown>;
  fitScore: number | null;
  profileSummary: string | null;
  user: { name: string | null; email: string | null };
  skills: { skillName: string; isValidated: boolean; source: string | null }[];
};

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return d;
}

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

export default function CandidateSearchPage() {
  const { status } = useSession();
  const router = useRouter();

  const [skills, setSkills]     = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole]         = useState("");
  const [results, setResults]   = useState<Candidate[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const dSkills   = useDebounce(skills, 400);
  const dLocation = useDebounce(location, 400);
  const dRole     = useDebounce(role, 400);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/employer/saved-candidates")
      .then(r => r.ok ? r.json() : { saved: [] })
      .then(d => setSavedIds(new Set((d.saved ?? []).map((s: { candidate: { id: string } }) => s.candidate.id))));
  }, [status]);

  const search = useCallback(async () => {
    if (!dSkills && !dLocation && !dRole) { setResults([]); setSearched(false); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (dSkills)   params.set("skills", dSkills);
      if (dLocation) params.set("location", dLocation);
      if (dRole)     params.set("role", dRole);
      const r = await fetch(`/api/employer/candidate-search?${params}`, { signal: ctrl.signal });
      if (r.status === 403) { setForbidden(true); return; }
      const d = r.ok ? await r.json() : { candidates: [], total: 0 };
      setResults(d.candidates ?? []);
      setTotal(d.total ?? 0);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setResults([]);
    } finally {
      setLoading(false);
    }
  }, [dSkills, dLocation, dRole]);

  useEffect(() => { if (status === "authenticated") search(); }, [search, status]);

  async function toggleSave(candidateId: string) {
    const isSaved = savedIds.has(candidateId);
    setSavedIds(prev => { const n = new Set(prev); isSaved ? n.delete(candidateId) : n.add(candidateId); return n; });
    await fetch("/api/employer/saved-candidates", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    }).catch(() => null);
  }

  if (forbidden) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900">Enterprise plan required</h1>
          <p className="mt-2 text-sm text-gray-500">
            Proactive candidate search is available on the Enterprise plan.
            Upgrade to search and contact candidates directly.
          </p>
          <Link href="/employer"
            className="mt-6 inline-block rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Employer dashboard
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
            <span className="rounded-full bg-[#4D31EC] px-2.5 py-0.5 text-xs font-semibold text-white">Enterprise</span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Search the full candidate pool by skills, location, or role.</p>

          {/* Filters */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Skills (comma-separated)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Python" className={INPUT} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, Remote" className={INPUT} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Current role</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" className={INPUT} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Status */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        )}

        {!loading && !searched && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-gray-400 font-medium">Enter a skill, location, or role to search candidates</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">No candidates found</p>
            <p className="mt-1 text-sm text-gray-400">We've notified the platform team about this gap in the talent pool.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {total} candidate{total !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map(c => {
                const skills: string[] = Array.isArray(c.primarySkills)
                  ? c.primarySkills as string[]
                  : Object.keys(c.primarySkills ?? {});
                const verified = c.skills.filter(s => s.isValidated);
                const isSaved = savedIds.has(c.id);
                return (
                  <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/employer/candidates/${c.id}`}
                          className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                          {c.user.name ?? "—"}
                        </Link>
                        {verified.length > 0 && (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                            {verified.length} verified skill{verified.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {c.fitScore != null && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                            ${c.fitScore >= 0.7 ? "bg-emerald-50 text-emerald-700" : c.fitScore >= 0.4 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                            {Math.round(c.fitScore * 100)}% fit
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {[c.currentRole, c.location].filter(Boolean).join(" · ")}
                      </p>
                      {c.profileSummary && (
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{c.profileSummary}</p>
                      )}
                      {skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skills.slice(0, 6).map(s => (
                            <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                          ))}
                          {skills.length > 6 && (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">+{skills.length - 6}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleSave(c.id)}
                        title={isSaved ? "Remove from saved" : "Save candidate"}
                        className={`text-xl leading-none transition-colors ${isSaved ? "text-[#4D31EC]" : "text-gray-300 hover:text-[#4D31EC]"}`}
                      >
                        {isSaved ? "★" : "☆"}
                      </button>
                      <Link href={`/employer/candidates/${c.id}`}
                        className="rounded-lg border border-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                        View profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
