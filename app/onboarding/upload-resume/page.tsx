"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useRef, useState } from "react";

export default function UploadResumePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/resume", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Upload failed"); return; }
      setFileName(file.name);
      setUploaded(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        <Image src="/logo.png" alt="WorkCrew.ai" width={116} height={21}
          className="absolute left-[50px] top-[50px]" priority />
        <div className="flex flex-col items-center md:items-start justify-center mt-10 space-y-6">
          <Image src="/pana.png" alt="Upload resume illustration" width={260} height={260}
            className="object-contain mb-2" priority />
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">Upload your resume</h1>
            <p className="mt-3 max-w-md text-gray-600 text-sm md:text-base">
              Uploading a resume helps employers review your qualifications and improves your job matches.
            </p>
          </div>
        </div>
        <button onClick={() => router.push("/onboarding/personal-details")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600">
          Skip for now
        </button>
      </section>

      <section className="flex items-center justify-center px-8 py-16 md:px-24">
        <div className="mx-auto w-full max-w-xl text-center">
          <h2 className="text-4xl font-semibold text-[#4D31EC]">Let's get started!</h2>
          <p className="mt-2 text-gray-500">Upload your resume to get matched to jobs.</p>

          <div className="mt-10 space-y-6">
            {uploaded ? (
              <div className="rounded-2xl border-2 border-[#4D31EC] bg-[#F9F8FF] p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-gray-900">{fileName}</p>
                <p className="mt-1 text-sm text-[#4D31EC]">Resume uploaded successfully</p>
                <button onClick={() => { setUploaded(false); setFileName(null); }}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
                  Upload a different file
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#C8C6FF] bg-[#F9F8FF] p-8 hover:border-[#4D31EC] transition">
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                <div className="flex flex-col items-center justify-center text-[#4D31EC]">
                  {uploading ? (
                    <p className="font-medium animate-pulse">Uploading…</p>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-6 w-6" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                      </svg>
                      <span className="font-medium">Upload resume</span>
                      <span className="mt-1 text-sm text-gray-400">PDF or Word · max 5 MB</span>
                    </>
                  )}
                </div>
              </label>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button onClick={() => router.push("/onboarding/personal-details")}
              disabled={uploading}
              className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
              Continue →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
