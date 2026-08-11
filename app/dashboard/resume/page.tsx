"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function ResumePage() {
  const { status } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

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

  async function handleRemove() {
    setRemoving(true);
    await fetch("/api/resume", { method: "DELETE" }).catch(() => null);
    setResumeUrl(null);
    setRemoving(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
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

      <div className="mx-auto max-w-3xl px-6 py-8">
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
              <div className="flex flex-shrink-0 gap-2">
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
            onDrop={handleDrop}
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

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {uploading && !resumeUrl && (
          <p className="mt-3 text-sm text-[#4D31EC] animate-pulse">Uploading…</p>
        )}
      </div>
    </main>
  );
}
