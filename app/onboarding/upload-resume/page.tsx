"use client";

import { useRouter } from "next/navigation";
import React from "react";

function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try { return JSON.parse(localStorage.getItem("wc_onboard") || "{}"); } catch { return {} as T; }
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
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT light panel */}
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Upload or create your resume</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Uploading or creating a resume is required to continue. This helps employers review your qualifications effectively.
        </p>
      </section>

      {/* RIGHT */}
      <section className="p-10 md:p-16 flex items-center">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-4xl font-semibold text-center text-[#4D31EC]">Let’s get started!</h2>
          <p className="text-center text-gray-500 mt-2">
            Upload your resume or create one to get matched to jobs!
          </p>

          <div className="mt-10 space-y-6">
            <label className="block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-[#4D31EC]">
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              <div className="text-[#4D31EC] text-2xl">⬆️</div>
              <div className="mt-3 font-medium">Upload resume</div>
              {fileName && <div className="text-sm text-gray-500 mt-1">{fileName}</div>}
            </label>

            <button
              className="w-full border rounded-2xl p-8 text-center hover:border-[#4D31EC]"
              onClick={() => { saveDraft({ wantsBuilder: true }); router.push("/onboarding/personal-details"); }}
            >
              <div className="text-2xl">🧩</div>
              <div className="mt-3 font-medium">Create resume</div>
            </button>

            <div className="pt-2">
              <button
                onClick={() => router.push("/onboarding/personal-details")}
                className="w-full bg-[#4D31EC] text-white py-3 rounded-full font-semibold hover:bg-[#3b25b5]"
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
