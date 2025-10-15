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

export default function WorkExperiencePage() {
  const router = useRouter();
  const draft = loadDraft();

  const [exp, setExp] = React.useState({
    company: draft.exp?.company || "",
    title: draft.exp?.title || "",
    start: draft.exp?.start || "",
    end: draft.exp?.end || "",
    current: draft.exp?.current || false,
    bullets: draft.exp?.bullets || "",
  });

  function next() {
    saveDraft({ exp });
    router.push("/onboarding/education");
  }

  function prev() {
    saveDraft({ exp });
    router.back();
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Add your work experience</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          To improve your job matches, please enter your work experience. We match jobs with increased accuracy if we know your work experience!
        </p>
      </section>

      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Work experience</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Company name *</label>
              <input
                value={exp.company}
                onChange={(e) => setExp({ ...exp, company: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: WorkCrew.ai"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Job title *</label>
              <input
                value={exp.title}
                onChange={(e) => setExp({ ...exp, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: Software developer"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Start date *</label>
              <input
                value={exp.start}
                onChange={(e) => setExp({ ...exp, start: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="MM-YYYY"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End date *</label>
              <input
                disabled={exp.current}
                value={exp.end}
                onChange={(e) => setExp({ ...exp, end: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC] disabled:bg-gray-100" placeholder="MM-YYYY"
              />
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input type="checkbox" className="accent-[#4D31EC]" checked={exp.current} onChange={(e) => setExp({ ...exp, current: e.target.checked })} />
                I currently work here
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Responsibilities & achievements *</label>
              <textarea
                rows={6}
                value={exp.bullets}
                onChange={(e) => setExp({ ...exp, bullets: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder={`• Describe your key responsibilities and achievements
• Use bullet points and include metrics where possible`}
              />
            </div>
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
