// PATH: app/onboarding-employer/signup/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import LeftRail from "../_lib/LeftRail";
import { loadDraft, saveDraft } from "../_lib/draft";

/* Arrow icon for the Next button */
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

function SignupPage() {
  const router = useRouter();
  const draft = loadDraft();

  const [f, setF] = React.useState({
    firstName: draft.firstName || "",
    lastName: draft.lastName || "",
    email: draft.email || "",
    password: draft.password || "",
    confirm: "",
    agree: !!draft.agreeTos,
    marketing: !!draft.marketing,
  });

  const canNext =
    f.firstName.trim() &&
    f.lastName.trim() &&
    /\S+@\S+\.\S+/.test(f.email) &&
    f.password.length >= 6 &&
    f.password === f.confirm &&
    f.agree;

  function next() {
    if (!canNext) return;
    saveDraft({
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      password: f.password,
      agreeTos: f.agree,
      marketing: f.marketing,
    });
    router.push("/onboarding-employer/company");
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* LEFT rail */}
      <LeftRail
        title="Get started and find exceptional talent!"
        blurb="From sourcing to onboarding, WorkCrew.ai helps you find and manage exceptional talent effortlessly."
        illustration="/pana.png"
        bottomLink={
          <span className="text-sm text-gray-600">
            Not sure yet?{" "}
            <a className="underline text-[#4D31EC]" href="/pricing">
              See pricing
            </a>
          </span>
        }
      />

      {/* RIGHT form */}
      <section
        className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px), repeating-linear-gradient(90deg, rgba(163,157,255,0.08) 0px, rgba(163,157,255,0.08) 1px, transparent 1px, transparent 38px)",
        }}
      >
        <div className="w-full max-w-3xl">
          <h2 className="text-center text-[22px] font-semibold text-[#4D31EC]">
            Create your account!
          </h2>
          <p className="mt-1 text-center text-xs text-gray-500">
            Enter your credentials to login
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.firstName}
                onChange={(e) => setF({ ...f, firstName: e.target.value })}
                placeholder="Eg: John"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.lastName}
                onChange={(e) => setF({ ...f, lastName: e.target.value })}
                placeholder="Eg: Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
                placeholder="Create your password"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4D31EC]"
                value={f.confirm}
                onChange={(e) => setF({ ...f, confirm: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-3xl space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.agree}
                onChange={(e) => setF({ ...f, agree: e.target.checked })}
              />
              <span className="text-gray-700">
                I agree to the{" "}
                <a className="underline text-[#4D31EC]" href="/legal/tos">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="underline text-[#4D31EC]" href="/legal/privacy">
                  Privacy Policy
                </a>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.marketing}
                onChange={(e) => setF({ ...f, marketing: e.target.checked })}
              />
              <span className="text-gray-700">
                Send me recent developments in the product and industry
              </span>
            </label>
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center">
            <button
              onClick={next}
              disabled={!canNext}
              className={[
                "inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all",
                canNext
                  ? "bg-[#4D31EC] hover:bg-[#3b25b5]"
                  : "cursor-not-allowed bg-gray-300",
              ].join(" ")}
            >
              <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                <ArrowRight className="h-4 w-4" />
              </span>
              Next
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            I already have an account.{" "}
            <a className="underline text-[#4D31EC]" href="/login">
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
