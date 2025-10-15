"use client";

import * as React from "react";

import {
  NewNavbar,
  HeroSection,
  MeetRahiBanner,
  WhyTheyLoveUs,
  WhyLoveUs,
  ReviewsSection,
  NewFooter,
} from "../workcrew-ui/components/landing";

import JobRoles from "../workcrew-ui/components/landing/JobRoles";
import { Section } from "../workcrew-ui/components/primitives";

function DevBuildBadge() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        background: "#ffe58f",
        padding: 6,
        zIndex: 9999,
      }}
    >
      BUILD: {Date.now()}
    </div>
  );
}

/** Section with zero vertical padding so spacing is controlled only by the stack */
function GapSection({ children }: { children: React.ReactNode }) {
  return (
    <Section size="lg" background="default" withContainer={false} className="!py-0">
      {children}
    </Section>
  );
}

export default function HomePage() {
  return (
    <main>
      <DevBuildBadge />

      {/* 1) Nav bar */}
      <NewNavbar />

      {/* 2) HeroSection */}
      <HeroSection />

      {/* All sections below are separated by EXACT 100px */}
      <div className="space-y-[100px]">
        {/* 3) Hire or Get Hired */}
        <GapSection>
          <WhyTheyLoveUs />
        </GapSection>

        {/* 4) Meet Rahi banner */}
        <GapSection>
          <MeetRahiBanner />
        </GapSection>

        {/* 5) Why professionals and teams love us */}
        <GapSection>
          <WhyLoveUs />
        </GapSection>

        {/* 5.1) Statement */}
        <GapSection>
          <div className="mx-auto max-w-[1106px] text-center">
            <div className="mx-auto flex flex-col items-center gap-[76px]">
              <div className="h-px w-[320px] bg-[#D0D5DD]" />
              <div className="mx-auto max-w-[625px]">
                <h2
                  className="text-[40px] font-medium leading-[1] tracking-[0.01em] text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  “WorkCrew.ai fixed the broken system.” – We say
                </h2>
                <p
                  className="mt-6 text-[32px] font-medium leading-[1] tracking-[0.01em] text-[#4D31EC]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Here’s what that means for you – New opportunities!
                </p>
              </div>
              <div className="h-px w-[320px] bg-[#D0D5DD]" />
            </div>
          </div>
        </GapSection>

        {/* 5.2) Job Roles */}
        <GapSection>
          <JobRoles />
        </GapSection>

        {/* 6) Reviews */}
        <GapSection>
          <ReviewsSection />
        </GapSection>

        {/* 7) Contact us */}
        <GapSection>
          <div>
            {/* Heading + subheading pinned 55px from viewport edge */}
            <div className="pl-[55px]">
              <h2
                className="mb-4 text-[48px] font-medium leading-[normal] tracking-[0.01em]"
                style={{ fontFamily: "'Schibsted Grotesk', sans-serif" }}
              >
                <span className="text-[#4D31EC]">Contact</span>{" "}
                <span className="text-black">us</span>
              </h2>

              <p
                className="mb-10 text-[20px] leading-[27px] tracking-[0.03em] text-black md:whitespace-nowrap"
                style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 400 }}
              >
                Connect with our team to discover how WorkCrew.ai can streamline your company’s
                talent acquisition and HR operations.
              </p>
            </div>

            {/* Centered form */}
            <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-8 md:px-10">
              <div className="mx-auto max-w-[800px]">
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <ContactField label="Company name" required htmlFor="company">
                    <ContactInput id="company" placeholder="Enter your company name" />
                  </ContactField>

                  <ContactField label="Contact person" required htmlFor="contactPerson">
                    <ContactInput id="contactPerson" placeholder="Your full name" />
                  </ContactField>

                  <ContactField label="Business email" required htmlFor="email">
                    <ContactInput id="email" type="email" placeholder="you@company.com" />
                  </ContactField>

                  <ContactField label="Phone number" required htmlFor="phone">
                    <div className="flex gap-3">
                      <ContactSelect
                        aria-label="Country code"
                        className="w-[86px]"
                        defaultValue="+91"
                        options={[
                          { value: "+91", label: "+91" },
                          { value: "+1", label: "+1" },
                          { value: "+44", label: "+44" },
                          { value: "+61", label: "+61" },
                        ]}
                      />
                      <ContactInput id="phone" placeholder="123456790" inputMode="numeric" />
                    </div>
                  </ContactField>

                  <ContactField label="Company size" required htmlFor="companySize">
                    <ContactSelect
                      id="companySize"
                      placeholder="Select company size"
                      options={[
                        { value: "1-10", label: "1–10" },
                        { value: "11-50", label: "11–50" },
                        { value: "51-200", label: "51–200" },
                        { value: "201-500", label: "201–500" },
                        { value: "500+", label: "500+" },
                      ]}
                    />
                  </ContactField>

                  <ContactField label="Your role" required htmlFor="role">
                    <ContactSelect
                      id="role"
                      placeholder="Select your role"
                      options={[
                        { value: "founder", label: "Founder / CXO" },
                        { value: "hr", label: "HR / TA" },
                        { value: "manager", label: "Hiring Manager" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </ContactField>

                  <div className="md:col-span-2">
                    <ContactField label="Description" htmlFor="desc">
                      <ContactTextarea
                        id="desc"
                        placeholder="Tell us more about your hiring needs"
                        rows={5}
                      />
                    </ContactField>
                  </div>

                  <div className="md:col-span-2 flex justify-center pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white
                               bg-[#5A3BFF] hover:bg-[#4F35E6] active:bg-[#442ECC]
                               shadow-[0_8px_24px_rgba(90,59,255,0.35)] transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-medium">Get in touch</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </GapSection>

        {/* 8) Footer */}
        <GapSection>
          <NewFooter />
        </GapSection>
      </div>
    </main>
  );
}

/* ========================
   Form primitives
   ======================== */

function ContactField({ label, htmlFor, required, children }: any) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block mb-2 text-[20px] tracking-[0.03em] text-black"
        style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500 }}
      >
        {label}
        {required && <span className="text-[#4D31EC]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function ContactInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full h-[52px] rounded-xl border-0 bg-[#F5F6F7]
                  px-4 text-[16px] tracking-[0.03em] text-[#929292] placeholder:text-[#929292]
                  focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20
                  focus:bg-white transition ${className ?? ""}`}
      style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500 }}
    />
  );
}

function ContactTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border-0 bg-[#F5F6F7]
                  px-4 py-3 text-[16px] tracking-[0.03em] text-[#929292] placeholder:text-[#929292]
                  focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20
                  focus:bg-white transition ${className ?? ""}`}
      style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500 }}
    />
  );
}

function ContactSelect({
  options,
  placeholder,
  className,
  ...rest
}: any) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        {...rest}
        className="w-full h-[52px] appearance-none rounded-xl border-0 bg-[#F5F6F7]
                   px-4 pr-10 text-[16px] tracking-[0.03em] text-[#929292]
                   focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20
                   focus:bg-white transition"
        style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500 }}
        defaultValue={rest.defaultValue ?? ""}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <svg
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="#6B7280"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
