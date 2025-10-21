// PATH: app/onboarding/upload-resume/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try {
    return JSON.parse(localStorage.getItem("wc_onboard") || "{}");
  } catch {
    return {} as T;
  }
}

function saveDraft(patch: Record<string, any>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft();
  localStorage.setItem("wc_onboard", JSON.stringify({ ...cur, ...patch }));
}

export default function UploadResumePage() {
  const router = useRouter();
  const [fileName, setFileName] = React.useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      saveDraft({ resumeName: f.name });
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT PANEL */}
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        {/* WorkCrew logo pinned top-left */}
        <Image
          src="/logo.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        {/* Illustration + Text Group */}
        <div className="flex flex-col items-center md:items-start justify-center mt-10 space-y-6">
          {/* Smaller Illustration */}
          <Image
            src="/pana.png"
            alt="Upload resume illustration"
            width={260}
            height={260}
            className="object-contain mb-2"
            priority
          />

          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">
              Upload or create your resume
            </h1>
            <p className="mt-3 max-w-md text-gray-600 text-sm md:text-base">
              Uploading or creating a resume is required to continue.
              This helps employers review your qualifications effectively.
            </p>
          </div>
        </div>

        {/* Skip link (bottom-left) */}
        <button
          onClick={() => router.push("/onboarding/personal-details")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex items-center justify-center px-8 py-16 md:px-24">
        <div className="mx-auto w-full max-w-xl text-center">
          <h2 className="text-4xl font-semibold text-[#4D31EC]">
            Let’s get started!
          </h2>
          <p className="mt-2 text-gray-500">
            Upload your resume or create one to get matched to jobs!
          </p>

          <div className="mt-10 space-y-6">
            {/* Upload resume box */}
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#C8C6FF] bg-[#F9F8FF] p-8 hover:border-[#4D31EC] transition">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFile}
              />
              <div className="flex flex-col items-center justify-center text-[#4D31EC]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                  />
                </svg>
                <span className="font-medium">Upload resume</span>
                {fileName && (
                  <span className="mt-1 text-sm text-gray-500">{fileName}</span>
                )}
              </div>
            </label>

            {/* Create resume box */}
            <button
              className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] p-8 hover:border-[#4D31EC] transition"
              onClick={() => {
                saveDraft({ wantsBuilder: true });
                router.push("/onboarding/personal-details");
              }}
            >
              <div className="flex flex-col items-center justify-center text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">Create resume</span>
              </div>
            </button>

            {/* Continue CTA */}
            <div className="pt-2">
              <button
                onClick={() => router.push("/onboarding/personal-details")}
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5]"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
