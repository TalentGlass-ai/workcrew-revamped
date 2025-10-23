"use client";

import * as React from "react";

export default function ContactUs(): React.ReactElement {
  return (
    <section id="contact" className="relative">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        {/* Heading (no Typography component) */}
        <h2 className="mb-4 font-display text-[48px] font-[500] leading-[normal] tracking-[0.01em]">
          <span className="text-[#5A3BFF]">Contact</span>{" "}
          <span className="text-black">us</span>
        </h2>

        {/* Subheading */}
        <p className="mb-8 font-alt text-[20px] tracking-[0.01em] text-[#1F2937]">
          Connect with our team to discover how WorkCrew.ai can streamline your
          company's talent acquisition an HR operations.
        </p>

        {/* Form */}
        <form
          className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            // handle submit
          }}
        >
          {/* Company name */}
          <Field label="Company name" required htmlFor="company">
            <Input id="company" placeholder="Enter your company name" />
          </Field>

          {/* Contact person */}
          <Field label="Contact person" required htmlFor="contactPerson">
            <Input id="contactPerson" placeholder="Your full name" />
          </Field>

          {/* Business email */}
          <Field label="Business email" required htmlFor="email">
            <Input id="email" type="email" placeholder="you@company.com" />
          </Field>

          {/* Phone number */}
          <Field label="Phone number" required htmlFor="phone">
            <div className="flex gap-3">
              <Select
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
              <Input id="phone" placeholder="123456790" inputMode="numeric" />
            </div>
          </Field>

          {/* Company size */}
          <Field label="Company size" required htmlFor="companySize">
            <Select
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
          </Field>

          {/* Your role */}
          <Field label="Your role" required htmlFor="role">
            <Select
              id="role"
              placeholder="Select your role"
              options={[
                { value: "founder", label: "Founder / CXO" },
                { value: "hr", label: "HR / TA" },
                { value: "manager", label: "Hiring Manager" },
                { value: "other", label: "Other" },
              ]}
            />
          </Field>

          {/* Description */}
          <div className="md:col-span-2">
            <Field label="Description" htmlFor="desc">
              <Textarea
                id="desc"
                placeholder="Tell us more about your hiring needs"
                rows={5}
              />
            </Field>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-center pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#5A3BFF] px-6 py-3 text-white shadow-[0_8px_24px_rgba(90,59,255,0.35)] transition hover:bg-[#4F35E6] active:bg-[#442ECC]"
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
    </section>
  );
}

/* Minimal form primitives */
function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-alt text-[#111827]"
      >
        <span className="font-medium">{label}</span>
        {required && <span className="text-[#5A3BFF]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 font-alt text-[14px] text-[#111827] placeholder:text-[#9CA3AF] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15 ${className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 py-3 font-alt text-[14px] text-[#111827] placeholder:text-[#9CA3AF] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15 ${className ?? ""}`}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }
) {
  const { options, placeholder, className, ...rest } = props;
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        {...rest}
        className="h-[52px] w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 pr-10 font-alt text-[14px] text-[#111827] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15"
        defaultValue={rest.defaultValue ?? ""}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* caret */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
