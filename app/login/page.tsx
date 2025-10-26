// PATH: app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import T from "../../workcrew-ui/components/primitives/Typography";

export default function LoginPage() {
  const router = useRouter();

  // Employer default (per recruiter view), but ORIGINAL toggle styling
  const [role, setRole] = React.useState<"candidate" | "employer">("employer");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/onboarding/upload-resume");
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT (Blue half) */}
      <section className="relative hidden w-1/2 items-center justify-center bg-[#4D31EC] px-12 text-white md:flex">
        <Image
          src="/workcrew-icon.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="relative aspect-[16/10] w-full">
              <video
                src="/videos/resume_parse.mp4"
                poster="/login-left-poster.png"
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls={false}
                preload="metadata"
              />
            </div>
          </div>

          <T as="h2" variant="sub20" weight={600} className="mt-2 text-white">
            Smart resume parsing
          </T>
          <T
            as="p"
            variant="sub14"
            className="mt-2 text-white/80"
            lineHeightPx={22}
            trackingPct={3}
          >
            AI smartly extracts and organizes your skills, experience, and
            achievements from any resume format.
          </T>

          <div className="mt-8 flex gap-2">
            <div className="h-1.5 w-16 rounded-full bg-white" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      {/* RIGHT (Form) */}
      <section className="flex w-full items-center justify-center px-8 py-16 md:w-1/2 md:px-24">
        <div className="w-full max-w-lg">
          <T
            as="h1"
            variant="hero48"
            className="text-center"
            style={{ color: "#4D31EC" }}
            weight={600}
            autoLeading
          >
            Welcome!
          </T>
          <T
            as="p"
            variant="body16"
            className="mt-2 text-center text-gray-500"
            lineHeightPx={22}
            trackingPct={3}
          >
            Enter your credentials to login
          </T>

          {/* ORIGINAL two-button toggle (no pill wrapper) */}
          <div className="mt-6 flex justify-center gap-6">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`rounded-md px-8 py-2 transition ${
                role === "candidate"
                  ? "bg-[#4D31EC] text-white"
                  : "text-gray-800 hover:text-[#4D31EC]"
              }`}
            >
              <T as="span" variant="sub14" weight={600} trackingPct={2}>
                Candidate
              </T>
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`rounded-md px-8 py-2 transition ${
                role === "employer"
                  ? "bg-[#4D31EC] text-white"
                  : "text-gray-800 hover:text-[#4D31EC]"
              }`}
            >
              <T as="span" variant="sub14" weight={600} trackingPct={2}>
                Employer
              </T>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="mb-1 block">
                <T as="span" variant="body16" weight={500}>
                  {role === "employer" ? "Company email" : "Username or email"}
                </T>
              </label>
              <input
                id="username"
                name="username"
                pattern="^([A-Za-z0-9_.]{3,30}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$"
                title="Use an email or 3–30 characters (letters, numbers, dot or underscore)."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder={
                  role === "employer"
                    ? "Enter your username"
                    : "Enter your username or email"
                }
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block">
                <T as="span" variant="body16" weight={500}>
                  Password
                </T>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input name="remember" type="checkbox" className="accent-[#4D31EC]" />
                <T as="span" variant="sub14">
                  Remember me
                </T>
              </label>
              <Link href="/forgot-password" className="text-[#4D31EC]">
                <T as="span" variant="sub14" weight={600}>
                  Forgot password?
                </T>
              </Link>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-full bg-[#4D31EC] text-white transition hover:bg-[#3b25b5]"
            >
              <T as="span" variant="button">
                Login →
              </T>
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px w-full bg-gray-200" />
              <T as="span" variant="sub14" weight={600} className="text-black">
                or
              </T>
              <span className="h-px w-full bg-gray-200" />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border px-6 py-2"
                aria-label="Continue with Google"
              >
                <Image src="/flat-color-icons_google.png" alt="Google" width={16} height={16} />
                <T as="span" variant="sub14" weight={600}>
                  Google
                </T>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border px-6 py-2"
                aria-label="Continue with Microsoft"
              >
                <Image src="/logos_microsoft-icon.png" alt="Microsoft" width={16} height={16} />
                <T as="span" variant="sub14" weight={600}>
                  Microsoft
                </T>
              </button>
            </div>

            <T as="p" variant="sub14" className="text-center">
              Don’t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#4D31EC]">
                <T as="span" variant="sub14" weight={600}>
                  Sign up
                </T>
              </Link>
            </T>
          </form>
        </div>
      </section>
    </main>
  );
}
