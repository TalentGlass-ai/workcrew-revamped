// PATH: app/signup/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

export default function SignupPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/upload-resume");
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT (matches login page) */}
      <section className="relative hidden w-1/2 items-center justify-center bg-[#4D31EC] px-12 text-white md:flex">
        {/* WorkCrew icon: 50px from left, 50px below navbar */}
        <Image
          src="/workcrew-icon.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        {/* Centered content block */}
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          {/* White card like Figma tile */}
          <div className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="relative aspect-[16/10] w-full">
              <video
                src="/videos/resume_parse.mp4"
                poster="/login-left-poster.png"  // same poster as login
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls={false}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <h2 className="mt-2 text-2xl font-semibold">Smart resume parsing</h2>
          <p className="mt-2 text-sm text-white/80">
            AI smartly extracts and organizes your skills, experience, and achievements from any resume format.
          </p>

          {/* Slider bars (same order/style as login) */}
          <div className="mt-8 flex gap-2">
            <div className="h-1.5 w-16 rounded-full bg-white" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      {/* RIGHT (form) */}
      <section className="flex w-full items-center justify-center px-8 py-16 md:w-1/2 md:px-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-center text-4xl font-semibold" style={{ color: "#4D31EC" }}>
            Create your account!
          </h1>
          <p className="mt-2 text-center text-gray-500">Enter your credentials to login</p>

          <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">First name</label>
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Eg: John"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Last name</label>
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Eg: Doe"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Create your password"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Confirm password</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#4D31EC]" required /> I agree to the Terms of Service and
                Privacy Policy
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#4D31EC]" /> Send me job recommendations and career tips
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5]"
              >
                Sign up →
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
