// PATH: app/onboarding-employer/contact/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import LeftRail from "../_lib/LeftRail";
import { OnboardStepper, EMP_STEPS } from "../_lib/stepper";
import { loadDraft, saveDraft } from "../_lib/draft";

const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
    <path d="M9.707 4.293a1 1 0 0 1 0 1.414L7.414 8H16a1 1 0 1 1 0 2H7.414l2.293 2.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0Z" />
  </svg>
);
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

export default function EmployerContact() {
  const router = useRouter();
  const d = loadDraft();
  const [advancing, setAdvancing] = React.useState(false);
  const active = 1;

  const [f, setF] = React.useState({
    contactFirst: d.contactFirst || "",
    contactLast: d.contactLast || "",
    contactEmail: d.contactEmail || "",
    phoneCountry: d.phoneCountry || "+91",
    phone: d.phone || "",
    jobTitle: d.jobTitle || "",
    contactLocation: d.contactLocation || "",
    contactLinkedin: d.contactLinkedin || "",
  });

  const canNext =
    f.contactFirst.trim() &&
    f.contactLast.trim() &&
    /\S+@\S+\.\S+/.test(f.contactEmail) &&
    f.phone.trim();

  function prev() {
    router.back();
  }
  function next() {
    if (!canNext || advancing) return;
    saveDraft(f);
    setAdvancing(true);
    setTimeout(() => router.push("/onboarding-employer/verify"), 450);
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT rail — copy & illustration per screenshot */}
      <LeftRail
        title="Enter who to contact"
        blurb="Share your contact information so we can keep you updated on your hiring activity and ensure candidates and our team can reach you when needed."
        /* space is URL-encoded */
        illustration={"/work%20experience.png"}
      />

      {/* RIGHT — grid background + stepper + form */}
      <section
        className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px), repeating-linear-gradient(90deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px)",
        }}
      >
        <div className="w-full max-w-4xl">
          {/* Stepper */}
          <div className="mx-auto mb-6 mt-2 w-full max-w-3xl">
            <OnboardStepper steps={EMP_STEPS} active={active} advancing={advancing} />
          </div>

          {/* Title */}
          <h2 className="mb-8 text-center text-xl font-semibold text-[#4D31EC]">
            Contact information
          </h2>

          {/* Form — airy spacing, soft borders like mock */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.contactFirst}
                onChange={(e) => setF({ ...f, contactFirst: e.target.value })}
                placeholder="John"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.contactLast}
                onChange={(e) => setF({ ...f, contactLast: e.target.value })}
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.contactEmail}
                onChange={(e) => setF({ ...f, contactEmail: e.target.value })}
                placeholder="me@company.com"
              />
            </div>

            {/* Phone country + number */}
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-[#4D31EC]"
                  value={f.phoneCountry}
                  onChange={(e) => setF({ ...f, phoneCountry: e.target.value })}
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
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                  value={f.phone}
                  onChange={(e) => setF({ ...f, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Job title *</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.jobTitle}
                onChange={(e) => setF({ ...f, jobTitle: e.target.value })}
                placeholder="eg: Software developer"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contact’s location *</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.contactLocation}
                onChange={(e) => setF({ ...f, contactLocation: e.target.value })}
                placeholder="CA, USA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Contact’s LinkedIn profile</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.contactLinkedin}
                onChange={(e) => setF({ ...f, contactLinkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          {/* Footer actions — styled like mock */}
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between">
            <button
              onClick={prev}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <span className="inline-grid h-6 w-6 place-items-center rounded-full ring-1 ring-gray-300">
                <ArrowLeft className="h-4 w-4" />
              </span>
              Previous
            </button>

            <button
              onClick={next}
              disabled={!canNext}
              className={[
                "inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white",
                canNext ? "bg-[#4D31EC] hover:bg-[#3b25b5]" : "cursor-not-allowed bg-gray-300",
              ].join(" ")}
            >
              <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                <ArrowRight className="h-4 w-4" />
              </span>
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
