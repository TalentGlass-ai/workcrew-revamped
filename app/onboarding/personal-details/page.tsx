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

export default function PersonalDetailsPage() {
  const router = useRouter();
  const draft = loadDraft();

  const [form, setForm] = React.useState({
    firstName: (draft.firstName as string) || "",
    lastName: (draft.lastName as string) || "",
    email: (draft.email as string) || "",
    phoneCountry: (draft.phoneCountry as string) || "+91",
    phone: (draft.phone as string) || "",
    location: (draft.location as string) || "",
    linkedin: (draft.linkedin as string) || "",
    portfolio: (draft.portfolio as string) || "",
  });

  function next() {
    saveDraft(form);
    router.push("/onboarding/work-experience");
    // If you don't want persistence after submit, uncomment:
    // localStorage.removeItem("wc_onboard");
  }

  const activeStep = 0;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT */}
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
            src="/cuate.png"
            alt="Personal details illustration"
            width={180}
            height={180}
            className="object-contain"
            priority
          />

          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">
              Share your personal information
            </h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-gray-600">
              Start by entering your personal details and your LinkedIn profile so we can correctly
              match you with the jobs that match your profile!
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/onboarding/work-experience")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </section>

      {/* RIGHT */}
      <section className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          {/* Stepper */}
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <Stepper steps={STEPS} active={activeStep} />
          </div>

          <h2 className="mb-8 text-center text-2xl font-semibold text-[#4D31EC]">
            Personal details
          </h2>

          {/* Form */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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

            {/* Code + Phone */}
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <select
                  value={form.phoneCountry}
                  onChange={(e) => setForm({ ...form, phoneCountry: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="CA, San Fransisco"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">LinkedIn profile</label>
              <input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Portfolio link</label>
              <input
                value={form.portfolio}
                onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://johndoe.com"
              />
            </div>
          </div>

          {/* Next CTA centered */}
          <div className="mx-auto mt-10 flex max-w-3xl justify-center">
            <button
              onClick={next}
              className="flex items-center gap-2 rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5]"
            >
              <span>Next</span> <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
