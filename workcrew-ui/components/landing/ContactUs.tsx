// PATH: workcrew-ui/components/landing/ContactUs.tsx
"use client";

import * as React from "react";
import { MiscAPI } from "../../lib/endpoints";

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
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // basic front-end validation
  function validate() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return "Please enter a valid email address.";

    const phoneDigits = form.phone.replace(/\D/g, "");
    const phoneOk = /[0-9]{6,}/.test(phoneDigits);
    if (!phoneOk) return "Please enter a valid phone number.";

    if (!form.company.trim()) return "Company name is required.";
    if (!form.contactPerson.trim()) return "Contact person is required.";
    if (!form.companySize) return "Please select a company size.";
    if (!form.role) return "Please select your role.";

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setStatus("idle");
    setErrorMsg(null);

    const v = validate();
    if (v) {
      setErrorMsg(v);
      setStatus("error");
      return;
    }

    setSubmitting(true);
    try {
      const digitsOnlyPhone = form.phone.replace(/\D/g, "");

      const payload = {
        name: form.contactPerson,
        email: form.email.trim(),
        // send only digits to backend (matches many validator setups)
        phone: digitsOnlyPhone,
        company: form.company.trim(),
        description: form.desc,
      };

      console.log("CONTACT: sending payload", payload);

      const res = await MiscAPI.contactUs(payload); // POST /api/contactUs
      console.log("ContactUs OK:", res.status, res.data);

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (err: any) {
      console.error("Contact form error", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative !my-0 !py-0">
      {/* heading block aligned like app/page.tsx */}
      <div className="pl-[55px] pt-10 md:pt-12">
        <h2 className="mb-4 font-display text-[48px] font-medium leading-[normal] tracking-[0.01em]">
          <span className="text-[#4D31EC]">Contact</span>{" "}
          <span className="text-black">us</span>
        </h2>

        <p className="mb-6 font-alt text-[20px] font-normal leading-[27px] tracking-[0.03em] text-black md:whitespace-nowrap">
          Connect with our team to discover how WorkCrew.ai can streamline your
          company’s talent acquisition and HR operations.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 pb-10 sm:px-8 md:px-10">
        {/* global error/success messages */}
        <div className="mx-auto md:max-w-[800px] mb-4">
          {status === "error" && (
            <div className="mb-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMsg || "Failed to submit. Please try again."}
            </div>
          )}
          {status === "success" && (
            <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Thanks for reaching out — we’ll get back to you shortly.
            </div>
          )}
        </div>

        <div className="mx-auto md:max-w-[800px]">
          <form
            className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <ContactField label="Company name" required htmlFor="company">
              <ContactInput
                id="company"
                placeholder="Enter your company name"
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
              />
            </ContactField>

            <ContactField
              label="Contact person"
              required
              htmlFor="contactPerson"
            >
              <ContactInput
                id="contactPerson"
                placeholder="Your full name"
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
              />
            </ContactField>

            <ContactField label="Business email" required htmlFor="email">
              <ContactInput
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </ContactField>

            <ContactField label="Phone number" required htmlFor="phone">
              <div className="flex gap-3">
                <ContactSelect
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
                <ContactInput
                  id="phone"
                  placeholder="1234567890"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </ContactField>

            <ContactField label="Company size" required htmlFor="companySize">
              <ContactSelect
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
            </ContactField>

            <ContactField label="Your role" required htmlFor="role">
              <ContactSelect
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
            </ContactField>

            <div className="md:col-span-2">
              <ContactField label="Description" htmlFor="desc">
                <ContactTextarea
                  id="desc"
                  placeholder="Tell us more about your hiring needs"
                  rows={5}
                  value={form.desc}
                  onChange={(e) => updateField("desc", e.target.value)}
                />
              </ContactField>
            </div>

            <div className="md:col-span-2 flex justify-center pt-2">
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
                <span className="font-medium">
                  {submitting ? "Sending..." : "Get in touch"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* FORM PRIMITIVES — matching app/page.tsx look */

function ContactField({
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
        className="mb-2 block font-alt text-[20px] font-medium tracking-[0.03em] text-black"
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
      className={`h-[52px] w-full rounded-xl border-0 bg-[#F5F6F7] px-4 font-alt text-[16px] font-medium tracking-[0.03em] text-[#111827] placeholder:text-[#929292] transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20 ${
        className ?? ""
      }`}
    />
  );
}

function ContactTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border-0 bg-[#F5F6F7] px-4 py-3 font-alt text-[16px] font-medium tracking-[0.03em] text-[#111827] placeholder:text-[#929292] transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20 ${
        className ?? ""
      }`}
    />
  );
}

function ContactSelect({
  options,
  placeholder,
  className,
  ...rest
}: {
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        {...rest}
        className="h-[52px] w-full appearance-none rounded-xl border-0 bg-[#F5F6F7] px-4 pr-10 font-alt text-[16px] font-medium tracking-[0.03em] text-[#111827] transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5A3BFF]/20"
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
