"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

// step label shape we reuse
type Step = { key: string; label: string };

// tiny connector between the step circles
function Connector({
  filled,
  animate = false,
}: {
  filled: boolean;
  animate?: boolean;
}) {
  const [grow, setGrow] = React.useState(filled);

  React.useEffect(() => {
    if (filled || animate) {
      const id = requestAnimationFrame(() => setGrow(true));
      return () => cancelAnimationFrame(id);
    }
    setGrow(false);
  }, [filled, animate]);

  return (
    <div className="relative mx-2 h-10 flex-1">
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${
            grow ? "w-full bg-[#4D31EC]" : "w-0 bg-[#4D31EC]"
          }`}
        />
      </div>
    </div>
  );
}

// same stepper as personal / education / summary
function OnboardStepper({
  steps,
  active,
  advancing,
}: {
  steps: Step[];
  active: number;
  advancing?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {steps.map((s, i) => {
          const isDone = i < active;
          const isCurrent = i === active;
          const isUpcoming = i > active;

          return (
            <React.Fragment key={s.key}>
              <div className="relative flex shrink-0 basis-[88px] flex-col items-center">
                <div
                  className={[
                    "z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
                    isDone ? "bg-[#4D31EC] text-white" : "",
                    isCurrent
                      ? "bg-white ring-2 ring-[#4D31EC] text-[#4D31EC]"
                      : "",
                    isUpcoming
                      ? "bg-white ring-1 ring-gray-300 text-gray-400"
                      : "",
                  ].join(" ")}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="mt-2 w-[88px] text-center text-[12px] font-medium text-gray-700 md:text-sm">
                  {s.label}
                </div>
              </div>

              {i < steps.length - 1 && (
                <Connector
                  filled={i < active}
                  animate={advancing && i === active}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// helpers to persist the draft across steps
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

// keep this in sync with other onboarding pages
const STEPS: Step[] = [
  { key: "personal", label: "Personal details" },
  { key: "work", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "summary", label: "Professional summary" },
];

export default function WorkExperiencePage() {
  const router = useRouter();
  const draft = loadDraft();

  // form state seeded from whatever we already have
  const [exp, setExp] = React.useState({
    company: draft.exp?.company || "",
    title: draft.exp?.title || "",
    start: draft.exp?.start || "",
    end: draft.exp?.end || "",
    current: draft.exp?.current || false,
    bullets: draft.exp?.bullets || "",
  });

  // flag to let the connector animate before we go next
  const [advancing, setAdvancing] = React.useState(false);

  // 1 = work step in the flow
  const activeStep = 1;

  // end date can be empty only if "current" is checked
  const requiredFilled =
    [exp.company, exp.title, exp.start, exp.bullets].every(
      (v) => v.trim().length > 0
    ) && (exp.current || exp.end.trim().length > 0);

  function next() {
    if (!requiredFilled || advancing) return;
    saveDraft({ exp });
    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/education");
    }, 500);
  }

  function prev() {
    saveDraft({ exp });
    router.back();
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* left side stays fixed on desktop and frames the step */}
      <section className="relative hidden w-1/2 bg-[#F6F5FF] md:block">
        <div className="sticky top-0 h-screen px-10 py-16 md:px-20">
          <Image
            src="/logo.png"
            alt="WorkCrew.ai"
            width={116}
            height={21}
            className="absolute left-[50px] top-[50px]"
            priority
          />

          <div className="mt-10 flex h-full flex-col items-center justify-center space-y-6 md:items-start">
            <Image
              src="/work-experience.png"
              alt="Work experience illustration"
              width={180}
              height={180}
              className="object-contain"
              priority
            />

            <div className="text-center md:text-left">
              <h1 className="text-xl font-semibold text-black md:text-2xl">
                Add your work experience
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
                Add your latest role first. Clear bullet points with real
                impact make it easier to match you to better jobs.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/onboarding/education")}
            className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
          >
            Skip for now
          </button>
        </div>
      </section>

      {/* right side scrolls with the form */}
      <section className="flex w-full items-start justify-center bg-white px-6 py-10 md:w-1/2 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          {/* stepper at the top */}
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <OnboardStepper
              steps={STEPS}
              active={activeStep}
              advancing={advancing}
            />
          </div>

          <h2 className="mb-4 text-center text-2xl font-semibold text-[#4D31EC]">
            Work experience
          </h2>

          {/* small tip bar */}
          <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              Use bullet points and focus on impact. Numbers like “Increased
              retention by 20%” help a lot.
            </p>
          </div>

          {/* main form area */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                value={exp.company}
                onChange={(e) =>
                  setExp({ ...exp, company: e.target.value })
                }
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

            {/* start date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  value={exp.start}
                  onChange={(e) =>
                    setExp({ ...exp, start: e.target.value })
                  }
                  className="w-full rounded-lg border px-4 py-3 pl-10 outline-none focus:border-[#4D31EC]"
                  placeholder="DD-MM-YY"
                />
              </div>
            </div>

            {/* end date and current toggle */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                End date{" "}
                {exp.current ? "" : (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
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
                  onChange={(e) =>
                    setExp({ ...exp, current: e.target.checked })
                  }
                />
                I currently work here
              </label>
            </div>

            {/* bullets textarea */}
            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Responsibilities &amp; achievements{" "}
                  <span className="text-red-500">*</span>
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
                onChange={(e) =>
                  setExp({ ...exp, bullets: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder={`• Describe your key responsibilities and achievements
• Use bullet points for better readability
• Include metrics wherever possible
• Focus on results and impact
• Use AI suggestions to optimise your information`}
              />
            </div>
          </div>

          {/* navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prev}
              className="rounded-full border px-6 py-3 hover:border-[#4D31EC]"
            >
              ← Previous
            </button>
            <button
              onClick={next}
              disabled={!requiredFilled || advancing}
              className={[
                "rounded-full px-8 py-3 font-semibold text-white",
                requiredFilled && !advancing
                  ? "bg-[#4D31EC] hover:bg-[#3b25b5]"
                  : "cursor-not-allowed bg-gray-300",
              ].join(" ")}
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
