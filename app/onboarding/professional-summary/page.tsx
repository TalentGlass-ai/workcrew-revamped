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

// same stepper for all onboarding pages
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

// quick localStorage helpers
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

export default function ProfessionalSummaryPage() {
  const router = useRouter();
  const draft = loadDraft();

  // summary text, capped in the UI at 500 chars
  const [summary, setSummary] = React.useState<string>(draft.summary || "");
  const [advancing, setAdvancing] = React.useState(false);

  // 3 = summary step in the flow
  const activeStep = 3;

  // needs some text and max 500 chars
  const requiredFilled =
    summary.trim().length > 0 && summary.length <= 500;

  function next() {
    if (!requiredFilled || advancing) return;
    saveDraft({ summary });
    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/review");
    }, 500);
  }

  function prev() {
    saveDraft({ summary });
    router.back();
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* left side stays fixed on desktop and explains the step */}
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
              src="/proffesional-summary.png"
              alt="Professional summary illustration"
              width={180}
              height={180}
              className="object-contain"
              priority
            />

            <div className="text-center md:text-left">
              <h1 className="text-xl font-semibold text-black md:text-2xl">
                Form your professional summary
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
                Add a short summary that shows your strengths, goals, and why
                you stand out to employers.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/onboarding/review")}
            className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
          >
            Skip for now
          </button>
        </div>
      </section>

      {/* right side scrolls with the stepper and textarea */}
      <section className="flex w-full items-start justify-center bg-white px-6 py-10 md:w-1/2 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          {/* stepper on top */}
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <OnboardStepper
              steps={STEPS}
              active={activeStep}
              advancing={advancing}
            />
          </div>

          {/* title */}
          <h2 className="mb-6 text-center text-2xl font-semibold text-[#4D31EC]">
            Professional summary
          </h2>

          {/* tip bar */}
          <div className="mx-auto mb-6 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              Keep it to 2–3 sentences. Highlight your experience, core
              skills, and what you want next. Use action words and numbers
              where you can.
            </p>
          </div>

          {/* textarea for the summary */}
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                Professional summary
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#4D31EC] hover:underline"
                onClick={() => {
                  if (!summary) {
                    setSummary(
                      "Results-driven professional with X years of experience in Y. Proven track record of Z, with strengths in A, B, and C. Looking to create measurable impact in a growth-focused team."
                    );
                  }
                }}
              >
                + AI suggestion
              </button>
            </div>

            <textarea
              rows={8}
              maxLength={500}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#4D31EC]"
              placeholder="Write a short summary that covers your background, skills, and what you are looking for next…"
            />

            <div className="mt-1 text-right text-sm text-gray-500">
              {summary.length}/500 characters
            </div>
          </div>

          {/* previous / next buttons */}
          <div className="mx-auto mt-8 flex w-full max-w-3xl items-center justify-between">
            <button
              onClick={prev}
              className="flex items-center gap-2 rounded-full border px-6 py-3 hover:border-[#4D31EC]"
            >
              <span aria-hidden>←</span> Previous
            </button>
            <button
              onClick={next}
              disabled={!requiredFilled || advancing}
              className={[
                "flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white",
                requiredFilled && !advancing
                  ? "bg-[#4D31EC] hover:bg-[#3b25b5]"
                  : "cursor-not-allowed bg-gray-300",
              ].join(" ")}
            >
              <span aria-hidden>→</span> Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
