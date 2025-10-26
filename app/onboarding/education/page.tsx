"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

/* Step type shared across onboarding pages */
type Step = { key: string; label: string };

/* Connector between circles — width animates 0 → 100%, vertically centered */
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

/* Figma-like stepper (same as personal/work pages) */
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
                    isCurrent ? "bg-white ring-2 ring-[#4D31EC] text-[#4D31EC]" : "",
                    isUpcoming ? "bg-white ring-1 ring-gray-300 text-gray-400" : "",
                  ].join(" ")}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="mt-2 w-[88px] text-center text-[12px] font-medium text-gray-700 md:text-sm">
                  {s.label}
                </div>
              </div>

              {i < steps.length - 1 && (
                <Connector filled={i < active} animate={advancing && i === active} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* Draft helpers */
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

/* Keep order consistent across pages */
const STEPS: Step[] = [
  { key: "personal", label: "Personal details" },
  { key: "work", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "summary", label: "Professional summary" },
];

export default function EducationPage() {
  const router = useRouter();
  const draft = loadDraft();

  // Form state seeded from draft
  const [edu, setEdu] = React.useState({
    institution: draft.edu?.institution || "",
    degree: draft.edu?.degree || "",
    field: draft.edu?.field || "",
    year: draft.edu?.year || "",
    gpa: draft.edu?.gpa || "",
  });

  // Animate connector before routing
  const [advancing, setAdvancing] = React.useState(false);

  // 2 = this step
  const activeStep = 2;

  // Required fields gate (GPA optional)
  const requiredFilled = [
    edu.institution,
    edu.degree,
    edu.field,
    edu.year,
  ].every((v) => v.trim().length > 0);

  function next() {
    if (!requiredFilled || advancing) return;
    saveDraft({ edu });
    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/professional-summary");
    }, 500);
  }

  function prev() {
    saveDraft({ edu });
    router.back();
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: logo, illustration, helper text */}
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        <Image
          src="/logo.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        <div className="mt-10 flex flex-col items-center justify-center space-y-6 md:items-start">
          <Image
            src="/education.png"
            alt="Education illustration"
            width={180}
            height={180}
            className="object-contain"
            priority
          />

          <div className="text-center md:text-left">
            <h1 className="text-xl font-semibold text-black md:text-2xl">
              Add details of your education
            </h1>
            <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
              Showcasing your education helps employers understand your qualifications and makes your
              profile stand out.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/onboarding/professional-summary")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </section>

      {/* Right: stepper + form */}
      <section className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          {/* Stepper */}
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <OnboardStepper steps={STEPS} active={activeStep} advancing={advancing} />
          </div>

          {/* Page title */}
          <h2 className="mb-6 text-center text-2xl font-semibold text-[#4D31EC]">
            Education
          </h2>

          {/* Tip box */}
          <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              List your highest degree first. Include relevant coursework, honors, or academic achievements.
            </p>
          </div>

          {/* Form */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Institution name <span className="text-red-500">*</span>
              </label>
              <input
                value={edu.institution}
                onChange={(e) => setEdu({ ...edu, institution: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: National Institute of Technology"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                value={edu.degree}
                onChange={(e) => setEdu({ ...edu, degree: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: Bachelor of Science"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Field of study <span className="text-red-500">*</span>
              </label>
              <input
                value={edu.field}
                onChange={(e) => setEdu({ ...edu, field: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: Computer science"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Graduation year <span className="text-red-500">*</span>
              </label>
              <input
                value={edu.year}
                onChange={(e) => setEdu({ ...edu, year: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: 2020"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">GPA</label>
              <input
                value={edu.gpa}
                onChange={(e) => setEdu({ ...edu, gpa: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="eg: 8.3"
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
