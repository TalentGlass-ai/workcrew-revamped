"use client";

import React from "react";

export default function ContactUs() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    console.log("Contact form:", data);
  };

  return (
    <section className="px-6 py-16 md:py-24">
      {/* Heading + subcopy block (max 1106 like Figma) */}
      <div className="mx-auto max-w-[1106px]">
        <h2
          className="text-[48px] leading-[1] tracking-[0.01em]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 540 }} // Schibsted Grotesk, 540
        >
          <span className="text-[#4D31EC]">Contact</span> <span>us</span>
        </h2>

        <p
          className="mt-3 max-w-[980px] text-[20px] leading-[27px] tracking-[0.03em] text-[#475467]"
          style={{ fontFamily: "var(--font-sans)" }} // Archivo
        >
          Connect with our team to discover how WorkCrew.ai can streamline your
          company&apos;s talent acquisition and HR operations.
        </p>
      </div>

      {/* Form block (exact 744px width per Figma) */}
      <div className="mx-auto mt-10 max-w-[744px]">
        <form
          className="grid grid-cols-1 gap-[46px] md:grid-cols-2"
          onSubmit={onSubmit}
        >
          {/* Company name */}
          <Field label="Company name *" htmlFor="company">
            <input
              id="company"
              name="company"
              placeholder="Enter your company name"
              className={inputClass}
              required
            />
          </Field>

          {/* Contact person */}
          <Field label="Contact person *" htmlFor="contactPerson">
            <input
              id="contactPerson"
              name="contactPerson"
              placeholder="Your full name"
              className={inputClass}
              required
            />
          </Field>

          {/* Business email */}
          <Field label="Business email *" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              className={inputClass}
              required
            />
          </Field>

          {/* Phone number */}
          <Field label="Phone number *" htmlFor="phone">
            <div className="grid grid-cols-[92px,1fr] gap-3">
              <div className="relative">
                <select
                  name="countryCode"
                  defaultValue="+91"
                  className={selectClass}
                  aria-label="Country code"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                </select>
                <Chevron />
              </div>
              <input
                id="phone"
                name="phone"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456790"
                className={inputClass}
                required
              />
            </div>
          </Field>

          {/* Company size */}
          <Field label="Company size *" htmlFor="companySize">
            <div className="relative">
              <select
                id="companySize"
                name="companySize"
                defaultValue=""
                className={selectClass}
                required
              >
                <option value="" disabled>
                  Select company size
                </option>
                <option>1–10</option>
                <option>11–50</option>
                <option>51–200</option>
                <option>201–1000</option>
                <option>1000+</option>
              </select>
              <Chevron />
            </div>
          </Field>

          {/* Your role */}
          <Field label="Your role *" htmlFor="role">
            <div className="relative">
              <select
                id="role"
                name="role"
                defaultValue=""
                className={selectClass}
                required
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
              <Chevron />
            </div>
          </Field>

          {/* Description (full width) */}
          <Field label="Description" htmlFor="desc" className="md:col-span-2">
            <textarea
              id="desc"
              name="description"
              className={`${inputClass} h-[160px] resize-none`}
              placeholder="Tell us more about your hiring needs"
            />
          </Field>

          {/* CTA (centered, full width row) */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#4D31EC] px-6 py-3 text-white"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              <span>Get in touch</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

const inputClass =
  "block w-full h-[54px] rounded-[10px] bg-[#F5F6FA] px-4 text-[15px] " +
  "border border-[#E8EAF6] placeholder:text-slate-400 text-slate-800 outline-none " +
  "focus:border-[#C9C2FF] focus:ring-2 focus:ring-[#DAD6FF] transition";

const selectClass =
  "appearance-none block w-full h-[54px] rounded-[10px] bg-[#F5F6FA] px-4 pr-10 text-[15px] " +
  "border border-[#E8EAF6] text-slate-800 outline-none " +
  "focus:border-[#C9C2FF] focus:ring-2 focus:ring-[#DAD6FF] transition";

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      <span
        className="mb-2 block text-[15px] text-slate-800"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
