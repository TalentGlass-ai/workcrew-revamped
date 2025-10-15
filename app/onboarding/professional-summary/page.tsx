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

export default function ProfessionalSummaryPage() {
  const router = useRouter();
  const draft = loadDraft();
  const [summary, setSummary] = React.useState(draft.summary || "");

  function next() {
    saveDraft({ summary });
    router.push("/onboarding/review");
  }
  function prev() {
    saveDraft({ summary });
    router.back();
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Form your professional summary</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Add a professional summary to showcase your strengths, career goals, and what makes you stand out to employers.
        </p>
      </section>

      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Professional summary</h2>

          <div className="mt-8">
            <textarea
              rows={10}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#4D31EC]"
              placeholder="Write a compelling summary that highlights your professional background, key insights and career objectives…"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{summary.length}/500</div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prev} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
            <button onClick={next} className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">Next →</button>
          </div>
        </div>
      </section>
    </main>
  );
}
