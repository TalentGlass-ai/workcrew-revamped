// PATH: workcrew-ui/components/landing/ContactUs.tsx
"use client";

import * as React from "react";
import T from "../primitives/Typography";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const CONTACT_ENDPOINT = `${API_BASE}/api/contactUs`;

type FormState = {
  company: string;
  contactPerson: string;
  email: string;
  phoneCode: string;
  phone: string;
  companySize: string;
  role: string;
  desc: string;
};

const INITIAL_FORM: FormState = {
  company: "",
  contactPerson: "",
  email: "",
  phoneCode: "+91",
  phone: "",
  companySize: "",
  role: "",
  desc: "",
};

export default function ContactUs(): React.ReactElement {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus("idle");

    try {
      const payload = {
        // matches controller: { name, email, phone, company, description, linkedln }
        name: form.contactPerson,
        email: form.email,
        phone: `${form.phoneCode} ${form.phone}`.trim(),
        company: form.company,
        description: form.desc,
        linkedln: "", // backend expects this key; we don't collect it in this form (yet)
      };

      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success !== "true") {
        throw new Error(data?.message || "Contact request failed");
      }

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error("Contact form error", err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative !my-0 !py-0">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        <header className="mb-8">
          <T as="h2" variant="hero48" className="text-black">
            <span className="text-[#5A3BFF]">Contact</span> us
          </T>

          <T as="p" variant="sub20" className="mt-3 text-[#1F2937]">
            Connect with our team to discover how WorkCrew.ai can streamline
            your company’s talent acquisition and HR operations.
          </T>
        </header>

        <form
          className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <Field label="Company name" required htmlFor="company">
            <Input
              id="company"
              placeholder="Enter your company name"
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
          </Field>

          <Field label="Contact person" required htmlFor="contactPerson">
            <Input
              id="contactPerson"
              placeholder="Your full name"
              value={form.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
            />
          </Field>

          <Field label="Business email" required htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </Field>

          <Field label="Phone number" required htmlFor="phone">
            <div className="flex gap-3">
              <Select
                aria-label="Country code"
                className="w-[86px]"
                value={form.phoneCode}
                onChange={(e) => updateField("phoneCode", e.target.value)}
                options={[
                  { value: "+91", label: "+91" },
                  { value: "+1", label: "+1" },
                  { value: "+44", label: "+44" },
                  { value: "+61", label: "+61" },
                ]}
              />
              <Input
                id="phone"
                placeholder="1234567890"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </Field>

          <Field label="Company size" required htmlFor="companySize">
            <Select
              id="companySize"
              placeholder="Select company size"
              value={form.companySize}
              onChange={(e) => updateField("companySize", e.target.value)}
              options={[
                { value: "1-10", label: "1–10" },
                { value: "11-50", label: "11–50" },
                { value: "51-200", label: "51–200" },
                { value: "201-500", label: "201–500" },
                { value: "500+", label: "500+" },
              ]}
            />
          </Field>

          <Field label="Your role" required htmlFor="role">
            <Select
              id="role"
              placeholder="Select your role"
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              options={[
                { value: "founder", label: "Founder / CXO" },
                { value: "hr", label: "HR / TA" },
                { value: "manager", label: "Hiring Manager" },
                { value: "other", label: "Other" },
              ]}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description" htmlFor="desc">
              <Textarea
                id="desc"
                placeholder="Tell us more about your hiring needs"
                rows={5}
                value={form.desc}
                onChange={(e) => updateField("desc", e.target.value)}
              />
            </Field>
          </div>

          <div className="md:col-span-2 flex flex-col items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#5A3BFF] px-6 py-3 text-white shadow-[0_8px_24px_rgba(90,59,255,0.35)] transition hover:bg-[#4F35E6] active:bg-[#442ECC] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <T as="span" variant="sub14" className="font-semibold text-white">
                {submitting ? "Sending..." : "Get in touch"}
              </T>
            </button>

            {status === "success" && (
              <p className="text-sm text-green-700">
                Thanks for reaching out — we’ll get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">
                Something went wrong. Please try again or mail us directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

/* small form helpers so the JSX is easier to read */

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
      <label htmlFor={htmlFor} className="mb-2 block text-[#111827]">
        <T as="span" variant="body14" className="font-medium">
          {label}
        </T>
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
      className={`h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 font-alt text-[#111827] placeholder:text-[#9CA3AF] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15 ${
        className ?? ""
      }`}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 py-3 font-alt text-[#111827] placeholder:text-[#9CA3AF] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15 ${
        className ?? ""
      }`}
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
        className="h-[52px] w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F5F6F7] px-4 pr-10 font-alt text-[#111827] transition focus:border-[#5A3BFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/15"
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
