"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

// step label shape we reuse
type Step = { key: string; label: string };

type EduEntry = {
  institution: string;
  degree: string;
  field: string;
  year: string;
  gpa: string;
};

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

// same stepper as personal and work pages
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
                  i === 2 ? "-mt-[10px]" : "", // lift step 3 only
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

// quick localStorage helpers for the draft
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

// step order stays the same across onboarding
const STEPS: Step[] = [
  { key: "personal", label: "Personal details" },
  { key: "work", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "summary", label: "Professional summary" },
];

export default function EducationPage() {
  const router = useRouter();
  const draft = loadDraft();

  // normalise whatever is in localStorage into an array of education entries
  const [educations, setEducations] = React.useState<EduEntry[]>(() => {
    const fromArray = Array.isArray(draft.educations)
      ? draft.educations
      : null;

    if (fromArray && fromArray.length > 0) {
      return fromArray.map((e: Partial<EduEntry>) => ({
        institution: e.institution || "",
        degree: e.degree || "",
        field: e.field || "",
        year: e.year || "",
        gpa: e.gpa || "",
      }));
    }

    // fallback: older draft shape that only had a single `edu` object
    const single: EduEntry = {
      institution: draft.edu?.institution || "",
      degree: draft.edu?.degree || "",
      field: draft.edu?.field || "",
      year: draft.edu?.year || "",
      gpa: draft.edu?.gpa || "",
    };

    return [single];
  });

  // flag to let the connector animate before we move to next page
  const [advancing, setAdvancing] = React.useState(false);

  // 2 = education in the step list
  const activeStep = 2;

  // internal helpers: decide when a block is "empty" vs "complete"
  const isEmptyEdu = (e: EduEntry) =>
    !e.institution && !e.degree && !e.field && !e.year && !e.gpa;

  const isCompleteEdu = (e: EduEntry) =>
    [e.institution, e.degree, e.field, e.year].every(
      (v) => v.trim().length > 0
    );

  // at least one block should be fully filled,
  // and we don't allow half-filled blocks
  const hasAtLeastOneComplete = educations.some(isCompleteEdu);
  const allBlocksValid = educations.every(
    (e) => isEmptyEdu(e) || isCompleteEdu(e)
  );
  const requiredFilled = hasAtLeastOneComplete && allBlocksValid;

  function handleChange(
    index: number,
    field: keyof EduEntry,
    value: string
  ) {
    setEducations((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  function addEducation() {
    setEducations((prev) => [
      ...prev,
      { institution: "", degree: "", field: "", year: "", gpa: "" },
    ]);
  }

  function next() {
    if (!requiredFilled || advancing) return;

    // keep both new (array) and old (first item) shapes in draft
    const first = educations[0] || {
      institution: "",
      degree: "",
      field: "",
      year: "",
      gpa: "",
    };

    saveDraft({
      educations,
      edu: first,
    });

    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/professional-summary");
    }, 500);
  }

  function prev() {
    const first = educations[0] || {
      institution: "",
      degree: "",
      field: "",
      year: "",
      gpa: "",
    };

    saveDraft({
      educations,
      edu: first,
    });
    router.back();
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* left side stays fixed on desktop and gives the story */}
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
                Showcasing your education helps employers understand your
                qualifications and makes your profile stand out.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/onboarding/professional-summary")}
            className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
          >
            Skip for now
          </button>
        </div>
      </section>

      {/* right side scrolls with the form */}
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

          {/* small headline just to anchor the page */}
          <h2 className="mb-6 text-center text-2xl font-semibold text-[#4D31EC]">
            Education
          </h2>

          {/* soft tip bar to nudge the user */}
          <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl bg-[#EEEAFE] px-4 py-3 text-[#4D31EC]">
            <p className="text-sm">
              List your highest degree first. Include relevant coursework,
              honours, or academic achievements.
            </p>
          </div>

          {/* repeated education blocks */}
          <div className="space-y-8">
            {educations.map((edu, index) => (
              <div
                key={index}
                className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm"
              >
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  {`Education ${index + 1}`}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Institution name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={edu.institution}
                      onChange={(e) =>
                        handleChange(index, "institution", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(index, "degree", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(index, "field", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(index, "year", e.target.value)
                      }
                      className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                      placeholder="eg: 2020"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      GPA
                    </label>
                    <input
                      value={edu.gpa}
                      onChange={(e) =>
                        handleChange(index, "gpa", e.target.value)
                      }
                      className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                      placeholder="eg: 8.3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* "Add another education" CTA – slightly narrower than the cards above */}
          <div className="mx-auto mt-6 flex w-full max-w-2xl justify-center">
            <button
              type="button"
              onClick={addEducation}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:border-[#4D31EC] hover:text-[#4D31EC]"
            >
              Add another education
            </button>
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
