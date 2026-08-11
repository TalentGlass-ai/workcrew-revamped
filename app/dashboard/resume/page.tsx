"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  currentRole: string;
  totalExperience: number | null;
  skills: string[];
};

export default function ResumePage() {
  const { status } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const parseInputRef = useRef<HTMLInputElement>(null);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Parse state
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/candidates/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setResumeUrl(d?.resumeUrl ?? null))
      .finally(() => setLoading(false));
  }, [status]);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    setParsed(null);
    setApplied(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/resume", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Upload failed"); return; }
      setResumeUrl(d.url);
    } finally {
      setUploading(false);
    }
  }

  async function parseFile(file: File) {
    setParsing(true);
    setParsed(null);
    setError(null);
    setApplied(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/candidates/parse-resume", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Parsing failed"); return; }
      setParsed(d.parsed);
    } finally {
      setParsing(false);
    }
  }

  async function applyToProfile() {
    if (!parsed) return;
    setApplying(true);
    const body: Record<string, unknown> = {};
    if (parsed.name) body.name = parsed.name;
    if (parsed.phone) body.phone = parsed.phone;
    if (parsed.location) body.location = parsed.location;
    if (parsed.summary) body.profileSummary = parsed.summary;
    if (parsed.currentRole) body.currentRole = parsed.currentRole;
    if (parsed.totalExperience != null) body.totalExperience = parsed.totalExperience;
    await fetch("/api/candidates/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setApplying(false);
    setApplied(true);
    setParsed(null);
  }

  async function handleRemove() {
    setRemoving(true);
    await fetch("/api/resume", { method: "DELETE" }).catch(() => null);
    setResumeUrl(null);
    setRemoving(false);
    setParsed(null);
    setApplied(false);
  }

  if (status === "loading" || loading) return null;

  const fileName = resumeUrl ? resumeUrl.split("/").pop()?.split("?")[0] ?? "resume" : null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Resume</h1>
          <p className="mt-0.5 text-sm text-gray-500">Upload a PDF or Word document — recruiters see this on your profile.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {resumeUrl ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#4D31EC]/10 text-2xl">
                📄
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{fileName}</p>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#4D31EC] hover:underline">
                  View resume ↗
                </a>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => parseInputRef.current?.click()}
                  disabled={parsing}
                  className="rounded-lg bg-[#4D31EC] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors"
                >
                  {parsing ? "Parsing…" : "✨ Fill profile"}
                </button>
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="rounded-lg border border-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {removing ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
              dragging ? "border-[#4D31EC] bg-[#4D31EC]/5" : "border-gray-200 bg-white hover:border-[#4D31EC]/40"
            }`}
          >
            <span className="text-4xl mb-4">📄</span>
            <p className="font-semibold text-gray-800">
              {uploading ? "Uploading…" : "Drop your resume here, or click to browse"}
            </p>
            <p className="mt-1 text-sm text-gray-400">PDF or Word · max 5 MB</p>
          </label>
        )}

        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        {/* Separate hidden input for parse-only (doesn't re-upload) */}
        <input ref={parseInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ""; }} />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        {/* Parsing result card */}
        {parsed && (
          <div className="rounded-2xl border border-[#4D31EC]/20 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Profile suggestions from your resume</h2>
                <p className="mt-0.5 text-xs text-gray-400">Review and apply to your profile. Skills can be added from the Skills page.</p>
              </div>
              <button onClick={() => setParsed(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0">×</button>
            </div>

            <dl className="space-y-2 text-sm mb-5">
              {parsed.name && <Row label="Name" value={parsed.name} />}
              {parsed.phone && <Row label="Phone" value={parsed.phone} />}
              {parsed.location && <Row label="Location" value={parsed.location} />}
              {parsed.currentRole && <Row label="Current role" value={parsed.currentRole} />}
              {parsed.totalExperience != null && <Row label="Experience" value={`${parsed.totalExperience} yr${parsed.totalExperience !== 1 ? "s" : ""}`} />}
              {parsed.summary && <Row label="Summary" value={parsed.summary} />}
            </dl>

            {parsed.skills.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Skills found ({parsed.skills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map(s => (
                    <span key={s} className="rounded-md bg-[#4D31EC]/10 px-2 py-0.5 text-xs font-medium text-[#4D31EC]">{s}</span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Add skills from{" "}
                  <Link href="/dashboard/skills" className="text-[#4D31EC] hover:underline">Skills page ↗</Link>
                </p>
              </div>
            )}

            <button onClick={applyToProfile} disabled={applying}
              className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
              {applying ? "Applying…" : "Apply to profile"}
            </button>
          </div>
        )}

        {applied && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-semibold text-emerald-700">Profile updated ✓</p>
            <p className="mt-0.5 text-xs text-emerald-600">
              Your profile fields have been filled in.{" "}
              <Link href="/dashboard/profile" className="underline">Review your profile →</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 flex-shrink-0 text-xs font-semibold text-gray-400">{label}</dt>
      <dd className="text-gray-700 text-xs leading-relaxed">{value}</dd>
    </div>
  );
}
