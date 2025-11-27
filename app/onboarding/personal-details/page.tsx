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
      <div className="absolute top-1/2 -translate-y-1/2 -mt-[21px] h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${
            grow ? "w-full bg-[#4D31EC]" : "w-0 bg-[#4D31EC]"
          }`}
        />
      </div>
    </div>
  );
}

// same stepper for all onboarding steps
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
                    i === 2 ? "-mt-[10px]" : ""   // lift step 3 only
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

export default function PersonalDetailsPage() {
  const router = useRouter();
  const draft = loadDraft();

  // form state coming from the draft if it exists
  const [form, setForm] = React.useState({
    firstName: draft.firstName || "",
    lastName: draft.lastName || "",
    email: draft.email || "",
    phoneCountry: draft.phoneCountry || "+91",
    phone: draft.phone || "",
    location: draft.location || "",
    linkedin: draft.linkedin || "",
    portfolio: draft.portfolio || "",
  });

  // flag to let the connector animate before we move to next page
  const [advancing, setAdvancing] = React.useState(false);

  // 0 = first step in the flow
  const activeStep = 0;

  // required fields gate the next button
  const requiredFilled = [
    form.firstName,
    form.lastName,
    form.email,
    form.phone,
    form.location,
  ].every((v) => v.trim().length > 0);

  // save and move to work experience
  function next() {
    if (!requiredFilled || advancing) return;
    saveDraft(form);
    setAdvancing(true);
    setTimeout(() => {
      router.push("/onboarding/work-experience");
    }, 500);
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* left side stays fixed on desktop and gives context */}
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
              src="/cuate.png"
              alt="Personal details illustration"
              width={180}
              height={180}
              className="object-contain"
              priority
            />

            <div className="text-center md:text-left">
              <h1 className="text-xl font-semibold text-black md:text-2xl">
                Share your personal information
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
                Start by entering your personal details and your LinkedIn
                profile so we can match you with roles that fit you.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/onboarding/work-experience")}
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

          <h2 className="mb-8 text-center text-2xl font-semibold text-[#4D31EC]">
            Personal details
          </h2>

          {/* main form area */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="John"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="john.doe@example.com"
              />
            </div>

            {/* country code + phone in one row */}
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <select
                  value={form.phoneCountry}
                  onChange={(e) =>
                    setForm({ ...form, phoneCountry: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-3 outline-none focus:border-[#4D31EC]"
                >
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="CA, San Francisco"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                LinkedIn profile
              </label>
              <input
                value={form.linkedin}
                onChange={(e) =>
                  setForm({ ...form, linkedin: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Portfolio link
              </label>
              <input
                value={form.portfolio}
                onChange={(e) =>
                  setForm({ ...form, portfolio: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://johndoe.com"
              />
            </div>
          </div>

          {/* next button */}
          <div className="mx-auto mt-10 flex max-w-3xl justify-center">
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
              <span>Next</span> <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

