"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type Proposal = {
  id: string;
  proposedSlots: string[];
  confirmedSlot: string | null;
  status: string;
  meetingLink: string | null;
  notes: string | null;
};

type AppData = {
  id: string;
  currentStage: string;
  job: { title: string; organization: { name: string } };
  interview: Proposal | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function SchedulePage() {
  const { status } = useSession();
  const router = useRouter();
  const { id: applicationId } = useParams<{ id: string }>();

  const [app, setApp] = useState<AppData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/applications/${applicationId}/interview`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.application) setApp(d.application); else setNotFound(true); });
  }, [status, applicationId]);

  async function confirm(slot: string) {
    setConfirming(slot);
    const r = await fetch(`/api/applications/${applicationId}/interview`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedSlot: slot }),
    });
    if (r.ok) {
      setDone(true);
      setApp(prev => prev ? {
        ...prev,
        interview: prev.interview ? { ...prev.interview, confirmedSlot: slot, status: "confirmed" } : null,
      } : null);
    }
    setConfirming(null);
  }

  if (status === "loading" || (!app && !notFound)) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (notFound || !app?.interview) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">No interview proposal found</p>
          <p className="mt-2 text-sm text-gray-400">The recruiter hasn't proposed any times yet.</p>
          <Link href="/dashboard/applications" className="mt-5 inline-block text-sm font-semibold text-[#4D31EC] hover:underline">
            ← My applications
          </Link>
        </div>
      </main>
    );
  }

  const { interview, job } = app;
  const isConfirmed = interview.status === "confirmed" || done;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <Link href="/dashboard/applications" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← My applications
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Schedule Interview</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {job.title} · {job.organization.name}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {isConfirmed ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-base font-semibold text-emerald-800">Interview confirmed ✓</p>
            <p className="mt-1 text-sm text-emerald-700">
              {fmt(interview.confirmedSlot!)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {interview.meetingLink && (
                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                  Join meeting ↗
                </a>
              )}
              <a href={`/api/applications/${applicationId}/interview/ics`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                📅 Add to calendar
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-900">Pick a time that works for you</h2>
            {interview.notes && (
              <p className="mb-4 text-sm text-gray-500">{interview.notes}</p>
            )}
            <div className="space-y-3 mt-4">
              {(interview.proposedSlots as string[]).map(slot => (
                <button
                  key={slot}
                  onClick={() => confirm(slot)}
                  disabled={confirming !== null}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left hover:border-[#4D31EC]/40 hover:bg-[#4D31EC]/5 disabled:opacity-50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-800 group-hover:text-[#4D31EC] transition-colors">
                    {fmt(slot)}
                  </span>
                  <span className={`text-xs font-semibold text-[#4D31EC] ${confirming === slot ? "opacity-50" : ""}`}>
                    {confirming === slot ? "Confirming…" : "Confirm →"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {interview.meetingLink && !isConfirmed && (
          <p className="text-xs text-gray-400 text-center">
            Meeting link will be available once you confirm a time.
          </p>
        )}
      </div>
    </main>
  );
}
