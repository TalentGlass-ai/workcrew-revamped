"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

// Basic shape for the stepper labels
type Step = { key: string; label: string };

// Shape for a single work experience block
type Experience = {
  company: string;
  title: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string;
};

const BULLET_PREFIX = "• ";
const BULLET_HELP = `• Describe your key responsibilities and achievements
• Use bullet points for better readability
• Include metrics wherever possible
• Focus on results and impact
• Use AI suggestions to optimise your information`;

/* ----------------------- Connector between circles ----------------------- */
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
      <div className="absolute top-1/2 -mt-[21px] h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${
            grow ? "w-full bg-[#4D31EC]" : "w-0 bg-[#4D31EC]"
          }`}
        />
      </div>
    </div>
  );
}

/* ----------------------------- Stepper UI -------------------------------- */
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
              <div
                className={[
                  "relative flex shrink-0 basis-[88px] flex-col items-center",
                  i === 2 ? "-mt-[10px]" : "", // only lift step 3
                ].join(" ")}
              >
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

/* --------------------------- Draft helpers -------------------------------- */
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

/* ----------------------------- Step list ---------------------------------- */
const STEPS: Step[] = [
  { key: "personal", label: "Personal details" },
  { key: "work", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "summary", label: "Professional summary" },
];

export default function WorkExperiencePage() {
  const router = useRouter();
  const draft = loadDraft<{ exp?: Experience; experiences?: Experience[] }>();

  // Initialise from draft: prefer the new array, fall back to legacy single exp
  const [experiences, setExperiences] = React.useState<Experience[]>(() => {
    if (draft.experiences && draft.experiences.length > 0) {
      return draft.experiences;
    }
    if (draft.exp) {
      return [draft.exp];
    }
    return [
      {
        company: "",
        title: "",
        start: "",
        end: "",
        current: false,
        bullets: "",
      },
    ];
  });

  const [advancing, setAdvancing] = React.useState(false);
  const activeStep = 1; // 0=Personal, 1=Work, 2=Education, 3=Summary

  // Helper to update a single experience
  function updateExperience(index: number, patch: Partial<Experience>) {
    setExperiences((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  // Auto-bullet behaviour: every Enter adds a new "• "
  function handleBulletsKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    setExperiences((prev) => {
      const next = [...prev];
      const currentText = next[index].bullets || "";

      const needsInitialBullet =
        currentText.trim().length === 0 ||
        !currentText.startsWith(BULLET_PREFIX);

      const addition = needsInitialBullet
        ? BULLET_PREFIX
        : `\n${BULLET_PREFIX}`;

      next[index] = {
        ...next[index],
        bullets: currentText + addition,
      };
      return next;
    });
  }

  // When the user focuses an empty box, start them with the first bullet
  function handleBulletsFocus(index: number) {
    setExperiences((prev) => {
      const next = [...prev];
      if (!next[index].bullets.trim()) {
        next[index] = {
          ...next[index],
          bullets: BULLET_PREFIX,
        };
      }
      return next;
    });
  }

  // AI suggestion handler – currently drops in the helper text.
  // This is the place to call your backend AI endpoint.
  async function handleAISuggestion(index: number) {
    // TODO (backend hook): replace this with a fetch() call to your AI service.
    // Example (pseudo):
    // const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/ai/work-experience`, { ... })
    // const data = await resp.json();
    // const suggestion = data.text;
    const suggestion = BULLET_HELP; // fallback: static helper text

    setExperiences((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        bullets: suggestion,
      };
      return next;
    });
  }

  // Basic validity check – make sure at least the first card is filled in
  const first = experiences[0];
  const firstIsValid =
    [first.company, first.title, first.start, first.bullets].every(
      (v) => v.trim().length > 0
    ) && (first.current || first.end.trim().length > 0);

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      {
        company: "",
        title: "",
        start: "",
        end: "",
        current: false,
        bullets: "",
      },
    ]);
  }

  function persistDraft() {
    saveDraft({
      exp: experiences[0],
      experiences,
    });
  }

  function next() {
    if (!firstIsValid || advancing) return;
    persistDraft();
    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/education");
    }, 500);
  }

  function prev() {
    persistDraft();
    router.back();
  }

  function skip() {
    persistDraft();
    router.push("/onboarding/education");
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left rail: static illustration + copy */}
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
            {/* NOTE: file on disk is `work experience.png` */}
            <Image
              src="/work%20experience.png"
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
            onClick={skip}
            className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
          >
            Skip for now
          </button>
        </div>
      </section>

      {/* Right side: stepper + work experience cards */}
      <section className="flex w-full items-start justify-center bg-white px-6 py-10 md:w-1/2 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
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

          <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              Use bullet points and focus on impact. Numbers like &ldquo;Increased
              retention by 20%&rdquo; help a lot.
            </p>
          </div>

          {/* Experience cards */}
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-4 text-sm font-semibold text-gray-800 md:text-base">
                  Experience {index + 1}
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Company name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, { company: e.target.value })
                      }
                      className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC]"
                      placeholder="eg: WorkCrew.ai"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Job title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={exp.title}
                      onChange={(e) =>
                        updateExperience(index, { title: e.target.value })
                      }
                      className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC]"
                      placeholder="eg: Software developer"
                    />
                  </div>

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
                          updateExperience(index, { start: e.target.value })
                        }
                        className="w-full rounded-lg border px-4 py-3 pl-10 text-sm outline-none focus:border-[#4D31EC]"
                        placeholder="DD-MM-YY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      End date {!exp.current && (
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
                        onChange={(e) =>
                          updateExperience(index, { end: e.target.value })
                        }
                        className="w-full rounded-lg border px-4 py-3 pl-10 text-sm outline-none focus:border-[#4D31EC] disabled:bg-gray-100"
                        placeholder="DD-MM-YY"
                      />
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-700 md:text-sm">
                      <input
                        type="checkbox"
                        className="accent-[#4D31EC]"
                        checked={exp.current}
                        onChange={(e) =>
                          updateExperience(index, {
                            current: e.target.checked,
                            end: e.target.checked ? "" : exp.end,
                          })
                        }
                      />
                      I currently work here
                    </label>
                  </div>
                </div>

                {/* Responsibilities / achievements */}
                <div className="mt-6">
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-medium">
                      Responsibilities &amp; achievements{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <button
                       type="button"
                       onClick={() => handleAISuggestion(index)}
                       className="flex items-center gap-1 text-xs font-semibold text-[#4D31EC] hover:underline"
                    >
                    <Image
                       src="/AIsuggestions_icon.png"
                       alt="AI Suggestion"
                      width={10}
                      height={10}
                      className="inline-block"
                    />
                     AI suggestion
                   </button>

                  </div>

                  <textarea
                    rows={6}
                    value={exp.bullets}
                    onChange={(e) =>
                      updateExperience(index, { bullets: e.target.value })
                    }
                    onKeyDown={(e) => handleBulletsKeyDown(index, e)}
                    onFocus={() => handleBulletsFocus(index)}
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#4D31EC]"
                    placeholder={BULLET_HELP}
                  />
                </div>
              </div>
            ))}

            {/* Add another experience – slightly narrower than the card */}
            <div className="mt-2 flex w-full justify-center">
              <button
                type="button"
                onClick={addExperience}
                className="w-[90%] max-w-2xl rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Add another experience
              </button>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prev}
              className="rounded-full border px-6 py-3 text-sm hover:border-[#4D31EC]"
            >
              ← Previous
            </button>
            <button
              onClick={next}
              disabled={!firstIsValid || advancing}
              className={[
                "rounded-full px-8 py-3 text-sm font-semibold text-white",
                firstIsValid && !advancing
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
