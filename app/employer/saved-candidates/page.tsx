"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type SavedRow = {
  id: string;
  note: string | null;
  savedAt: string;
  candidate: {
    id: string;
    currentRole: string | null;
    location: string | null;
    primarySkills: string[] | Record<string, unknown>;
    fitScore: number | null;
    user: { name: string | null; email: string | null };
  };
};

export default function SavedCandidatesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/employer/saved-candidates")
      .then(r => r.ok ? r.json() : { saved: [] })
      .then(d => setRows(d.saved ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  async function unsave(candidateId: string) {
    setRemoving(candidateId);
    await fetch("/api/employer/saved-candidates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    }).catch(() => null);
    setRows(prev => prev.filter(r => r.candidate.id !== candidateId));
    setRemoving(null);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Employer dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Saved Candidates</h1>
          <p className="mt-0.5 text-sm text-gray-500">Your talent pool — candidates you've bookmarked for future roles.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">No saved candidates yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Bookmark candidates from the pipeline or suggested candidates view.
            </p>
            <Link href="/employer" className="mt-5 inline-block rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors">
              Go to pipeline →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(({ id, note, savedAt, candidate: c }) => {
              const skills: string[] = Array.isArray(c.primarySkills)
                ? c.primarySkills as string[]
                : Object.keys(c.primarySkills ?? {});
              return (
                <div key={id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:border-[#4D31EC]/20 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/employer/candidates/${c.id}`}
                        className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                        {c.user.name ?? "—"}
                      </Link>
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
                    {skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skills.slice(0, 5).map(s => (
                          <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                        ))}
                        {skills.length > 5 && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">+{skills.length - 5}</span>
                        )}
                      </div>
                    )}
                    {note && (
                      <p className="mt-2 text-xs text-gray-500 italic">"{note}"</p>
                    )}
                    <p className="mt-1.5 text-[10px] text-gray-300">
                      Saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Link href={`/employer/candidates/${c.id}`}
                      className="rounded-lg border border-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
                      View profile
                    </Link>
                    <button
                      onClick={() => unsave(c.id)}
                      disabled={removing === c.id}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      {removing === c.id ? "…" : "Remove"}
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
