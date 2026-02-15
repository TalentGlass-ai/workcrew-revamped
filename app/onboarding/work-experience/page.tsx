// PATH: app/onboarding/work-experience/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import Stepper, { Step } from "../Stepper";

function loadDraft(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("wc_onboard") || "{}");
  } catch {
    return {};
  }
}
function saveDraft(patch: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft();
  localStorage.setItem("wc_onboard", JSON.stringify({ ...cur, ...patch }));
}

const STEPS: Step[] = [
  { key: "personal",  label: "Personal details" },
  { key: "work",      label: "Work experience" },
  { key: "summary",   label: "Professional summary" },
  { key: "education", label: "Education" },
];

export default function WorkExperiencePage() {
  const router = useRouter();
  const draft = loadDraft();

  const [exp, setExp] = React.useState({
    company: ((draft.exp as Record<string, unknown>)?.company as string) || "",
    title: ((draft.exp as Record<string, unknown>)?.title as string) || "",
    start: ((draft.exp as Record<string, unknown>)?.start as string) || "",
    end: ((draft.exp as Record<string, unknown>)?.end as string) || "",
    current: ((draft.exp as Record<string, unknown>)?.current as boolean) || false,
    bullets: ((draft.exp as Record<string, unknown>)?.bullets as string) || "",
  });

  function next() {
    saveDraft({ exp });
    router.push("/onboarding/education");
    // If you don't want to persist after navigating:
    // localStorage.removeItem("wc_onboard");
  }

  function prev() {
    saveDraft({ exp });
    router.back();
  }

  const activeStep = 1; // 0=personal, 1=work (this page)

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT PANEL */}
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        {/* Logo pinned 50/50 */}
        <Image
          src="/logo.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        <div className="mt-10 flex flex-col items-center justify-center space-y-6 md:items-start">
          {/* Illustration – save the provided image in /public as work-experience.png */}
          <Image
            src="/work-experience.png"
            alt="Work experience illustration"
            width={180}
            height={180}
            className="object-contain"
            priority
          />

          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">
              Add your work experience
            </h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-gray-600">
              To improve your job matches, please enter your work experience. We
              match jobs with increased accuracy if we know your work experience!
            </p>
          </div>
        </div>

        {/* Skip link */}
        <button
          onClick={() => router.push("/onboarding/education")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          {/* Stepper */}
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <Stepper steps={STEPS} active={activeStep} />
          </div>

          {/* Page title */}
          <h2 className="mb-4 text-center text-2xl font-semibold text-[#4D31EC]">
            Work experience
          </h2>

          {/* Instruction box */}
          <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              Begin with your latest job. Use bullet points for achievements, including metrics
              (e.g., “Increased sales by 25%”).
            </p>
          </div>

          {/* Form */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                value={exp.company}
                onChange={(e) => setExp({ ...exp, company: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: WorkCrew.ai"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Job title <span className="text-red-500">*</span>
              </label>
              <input
                value={exp.title}
                onChange={(e) => setExp({ ...exp, title: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: Software developer"
              />
            </div>

            {/* Start date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  {/* calendar icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </span>
                <input
                  value={exp.start}
                  onChange={(e) => setExp({ ...exp, start: e.target.value })}
                  className="w-full rounded-lg border px-4 py-3 pl-10 outline-none focus:border-[#4D31EC]"
                  placeholder="DD-MM-YY"
                />
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                End date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </span>
                <input
                  disabled={exp.current}
                  value={exp.end}
                  onChange={(e) => setExp({ ...exp, end: e.target.value })}
                  className="w-full rounded-lg border px-4 py-3 pl-10 outline-none focus:border-[#4D31EC] disabled:bg-gray-100"
                  placeholder="DD-MM-YY"
                />
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#4D31EC]"
                  checked={exp.current}
                  onChange={(e) => setExp({ ...exp, current: e.target.checked })}
                />
                I currently work here
              </label>
            </div>

            {/* Bullets */}
            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Responsibilities &amp; achievements <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-[#4D31EC] hover:underline"
                  onClick={() =>
                    setExp((e) => ({
                      ...e,
                      bullets:
                        e.bullets ||
                        `• Describe your key responsibilities and achievements
• Use bullet points for better readability
• Include metrics wherever possible
• Focus on results and impact
• Use AI suggestions to optimise your information`,
                    }))
                  }
                >
                  + AI suggestion
                </button>
              </div>

              <textarea
                rows={6}
                value={exp.bullets}
                onChange={(e) => setExp({ ...exp, bullets: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder={`• Describe your key responsibilities and achievements
• Use bullet points for better readability
• Include metrics wherever possible
• Focus on results and impact
• Use AI suggestions to optimise your information`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prev}
              className="rounded-full border px-6 py-3 hover:border-[#4D31EC]"
            >
              ← Previous
            </button>
            <button
              onClick={next}
              className="rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5]"
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
