// PATH: app/onboarding-employer/company/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import LeftRail from "../_lib/LeftRail";
import { OnboardStepper, EMP_STEPS } from "../_lib/stepper";
import { loadDraft, saveDraft } from "../_lib/draft";

const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

export default function EmployerCompany() {
  const router = useRouter();
  const d = loadDraft();
  const [advancing, setAdvancing] = React.useState(false);
  const active = 0;

  const [f, setF] = React.useState({
    companyName: d.companyName || "",
    companySize: d.companySize || "",
    industry: d.industry || "",
    companyLocation: d.companyLocation || "",
    companyLinkedin: d.companyLinkedin || "",
    companySocial: d.companySocial || "",
    companyWebsite: d.companyWebsite || "",
    startupNoSite: !!d.startupNoSite,
    companyDescription: d.companyDescription || "",
  });

  const canNext = f.companyName.trim() && f.industry.trim();

  function next() {
    if (!canNext || advancing) return;
    saveDraft(f);
    setAdvancing(true);
    setTimeout(() => router.push("/onboarding-employer/contact"), 450);
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT rail — copy + illustration from screenshot */}
      <LeftRail
        title="Enter your company details"
        blurb="Enter your company details to set up your hiring account. This information helps us create a professional profile for your organization so candidates can easily recognize and trust your brand."
        illustration="/cuate.png"
      />

      {/* RIGHT pane — grid backdrop like mock */}
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
            Company details
          </h2>

          {/* Form — arranged to match screenshot */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {/* Company name (full width) */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companyName}
                onChange={(e) => setF({ ...f, companyName: e.target.value })}
                placeholder="eg: Microsoft"
              />
            </div>

            {/* Size + Industry (side by side) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Company size</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companySize}
                onChange={(e) => setF({ ...f, companySize: e.target.value })}
                placeholder="eg: 100-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.industry}
                onChange={(e) => setF({ ...f, industry: e.target.value })}
                placeholder="eg: Tech"
              />
            </div>

            {/* Location (full width) */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Company location <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companyLocation}
                onChange={(e) => setF({ ...f, companyLocation: e.target.value })}
                placeholder="CA, San Francisco"
              />
            </div>

            {/* LinkedIn + Social (side by side) */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Company LinkedIn profile
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companyLinkedin}
                onChange={(e) => setF({ ...f, companyLinkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourcompany"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Company social media
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companySocial}
                onChange={(e) => setF({ ...f, companySocial: e.target.value })}
                placeholder="https://johndoe.com"
              />
            </div>

            {/* Website (full) + startup checkbox */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Company website</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companyWebsite}
                onChange={(e) => setF({ ...f, companyWebsite: e.target.value })}
                placeholder="https://company.com"
              />
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.startupNoSite}
                  onChange={(e) => setF({ ...f, startupNoSite: e.target.checked })}
                />
                <span>We’re a startup and we don’t have a website yet</span>
              </label>
            </div>

            {/* Description (full) with “Enhance with AI” on the right */}
            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Company description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D31EC] hover:underline"
                  onClick={() => {/* hook up AI later */}}
                >
                  {/* tiny diamond-ish icon */}
                  <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#4D31EC]" />
                  Enhance with AI
                </button>
              </div>

              <textarea
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.companyDescription}
                onChange={(e) =>
                  setF({ ...f, companyDescription: e.target.value })
                }
                placeholder="Tell candidates about your company’s mission, product and culture."
              />
            </div>
          </div>

          {/* Actions — Next on the right, like the mock */}
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-end">
            <button
              onClick={next}
              disabled={!canNext}
              className={[
                "inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white",
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
