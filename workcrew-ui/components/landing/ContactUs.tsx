"use client";

import React from "react";

export default function ContactUs() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    console.log("Contact form:", data); // gotta hook up to API here
  };

  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 md:mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">
            <span className="text-[#4E35F2]">Contact</span>{" "}
            <span className="text-slate-900">us</span>
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Connect with our team to discover how WorkCrew.ai can streamline
            your company’s talent acquisition and HR operations.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Company name */}
            <Field label="Company name" required htmlFor="company">
              <input
                id="company"
                name="company"
                required
                placeholder="Enter your company name"
                className="input"
              />
            </Field>

            {/* Contact person */}
            <Field label="Contact person" required htmlFor="contactPerson">
              <input
                id="contactPerson"
                name="contactPerson"
                required
                placeholder="Your full name"
                className="input"
              />
            </Field>

            {/* Business email */}
            <Field label="Business email" required htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="input"
              />
            </Field>

            {/* Phone number (country + number) */}
            <Field label="Phone number" required htmlFor="phone">
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    name="countryCode"
                    defaultValue="+91"
                    className="input pr-8 appearance-none"
                    style={{ width: 84 }}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                  </select>
                  <ChevronDown />
                </div>
                <input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1234567890"
                  required
                  className="input flex-1"
                />
              </div>
            </Field>

            {/* Company size */}
            <Field label="Company size" required htmlFor="companySize">
              <div className="relative">
                <select
                  id="companySize"
                  name="companySize"
                  required
                  defaultValue=""
                  className="input w-full appearance-none pr-8"
                >
                  <option value="" disabled>
                    Select company size
                  </option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-1000">201–1000</option>
                  <option value="1000+">1000+</option>
                </select>
                <ChevronDown />
              </div>
            </Field>

            {/* Your role */}
            <Field label="Your role" required htmlFor="role">
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue=""
                  className="input w-full appearance-none pr-8"
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option>HR</option>
                  <option>Recruiter</option>
                  <option>Hiring Manager</option>
                  <option>Founder / CXO</option>
                  <option>Other</option>
                </select>
                <ChevronDown />
              </div>
            </Field>

            {/* Description (full width) */}
            <div className="md:col-span-2">
              <Field label="Description" htmlFor="desc">
                <textarea
                  id="desc"
                  name="description"
                  rows={4}
                  placeholder="Tell us more about your hiring needs"
                  className="input resize-y"
                />
              </Field>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="
                inline-flex h-[48px] items-center gap-2 rounded-full
                bg-[#5B4BFF] px-6 text-sm font-semibold text-white
                shadow-[0_10px_24px_rgba(91,75,255,0.35)]
                ring-1 ring-white/30 hover:brightness-105
              "
            >
              <ArrowNortheast />
              Get in touch
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}


function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-[13px] font-medium text-slate-700">
        {label} {required && <span className="text-[#5B4BFF]">*</span>}
      </span>
      {children}
    </label>
  );
}

/* Shared input styles via Tailwind's arbitrary variant */
const baseInput =
  "w-full rounded-lg border border-slate-200 bg-[#F7F8FA] px-3 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#C8CEFF] focus:ring-2 focus:ring-[#E7E9FF]";

declare module "react" {
  interface HTMLAttributes<T> {
    className?: string;
  }
}
// need to Attach class to global (workaround for snippet)
;(globalThis as any).nothing = null;
// @ts-ignore
const style = `
.input { @apply ${baseInput}; }
`;

/* Icons */
function ArrowNortheast() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-500"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
    </svg>
  );
}
