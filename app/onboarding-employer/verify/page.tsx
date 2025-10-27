// PATH: app/onboarding-employer/verification/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import LeftRail from "../_lib/LeftRail";
import { OnboardStepper, EMP_STEPS } from "../_lib/stepper";
import { loadDraft } from "../_lib/draft";

/* Small helper: if it's a URL, render a link; else plain text. */
function LinkOrText({ value }: { value?: string }) {
  if (!value) return <span>—</span>;
  const looksUrl = /^https?:\/\//i.test(value);
  return looksUrl ? (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="text-[#4D31EC] underline break-words"
    >
      {value}
    </a>
  ) : (
    <span>{value}</span>
  );
}

/* Single row with left label + right value (like screenshot) */
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900 text-right max-w-[380px]">
        {value ? <LinkOrText value={value} /> : "—"}
      </div>
    </div>
  );
}

export default function EmployerVerify() {
  const d = loadDraft();
  const active = 2;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT RAIL — use provided image */}
      <LeftRail
        title="Let’s verify your account"
        blurb="Verify your account to secure your profile and enable full access to WorkCrew.ai’s features. This step ensures your information is protected and trusted."
        illustration="/onboarding-employer/verfication.png"
      />

      {/* RIGHT — stepper + cards; faint grid background to match mock */}
      <section
        className="relative flex items-start justify-center px-6 py-10 md:px-12 md:py-16"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px), repeating-linear-gradient(90deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px)",
        }}
      >
        <div className="w-full max-w-4xl">
          {/* Stepper */}
          <div className="mx-auto mb-6 mt-2 w-full max-w-3xl">
            <OnboardStepper steps={EMP_STEPS} active={active} />
          </div>

          {/* Title */}
          <h2 className="mb-6 text-center text-xl font-semibold text-[#4D31EC]">
            Verification
          </h2>

          <div className="space-y-6">
            {/* Profile information */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Profile information
                </h3>
                <Link
                  className="text-sm font-medium text-[#4D31EC]"
                  href="/onboarding-employer/signup"
                >
                  Edit
                </Link>
              </div>
              <div className="space-y-3">
                <Row
                  label="Name"
                  value={`${d.firstName ?? ""} ${d.lastName ?? ""}`.trim()}
                />
                <Row label="Email" value={d.email} />
              </div>
            </section>

            {/* Company details */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Company details
                </h3>
                <Link
                  className="text-sm font-medium text-[#4D31EC]"
                  href="/onboarding-employer/company"
                >
                  Edit
                </Link>
              </div>

              {/* two-column like screenshot */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Company name" value={d.companyName} />
                <Row label="Company size" value={d.companySize} />
                <Row label="Industry" value={d.industry} />
                <Row label="Location" value={d.companyLocation} />
                <Row label="LinkedIn" value={d.companyLinkedin} />
                <Row
                  label="Website"
                  value={
                    d.companyWebsite ||
                    (d.startupNoSite ? "No website yet" : undefined)
                  }
                />

                {/* Description full width */}
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600">Company description</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-gray-900">
                    {d.companyDescription ||
                      "—"}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact information */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Contact information
                </h3>
                <Link
                  className="text-sm font-medium text-[#4D31EC]"
                  href="/onboarding-employer/contact"
                >
                  Edit
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row
                  label="Name"
                  value={`${d.contactFirst ?? ""} ${d.contactLast ?? ""}`.trim()}
                />
                <Row label="Email" value={d.contactEmail} />
                <Row
                  label="Phone"
                  value={
                    [d.phoneCountry, d.phone].filter(Boolean).join(" ") || undefined
                  }
                />
                <Row label="Job title" value={d.jobTitle} />
                <Row label="Location" value={d.contactLocation} />
                <Row label="LinkedIn" value={d.contactLinkedin} />
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mx-auto mt-10 flex max-w-3xl justify-center">
            <a
              href="/onboarding-employer/pricing"
              className="flex items-center gap-2 rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5]"
            >
              Proceed to plans →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
