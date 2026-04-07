// PATH: app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import T from "@/components/primitives/Typography";

import { signIn } from "next-auth/react";
import { toast } from "sonner"; // We can add sonner toasts for errors

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"candidate" | "employer">("candidate");
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    // Call NextAuth Credentials Provider
    const result = await signIn("credentials", {
      username,
      password,
      role,
      redirect: false, // Handle routing manually
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid credentials", { description: "Please check your username and password." });
    } else {
      toast.success("Login successful!");
      router.push("/onboarding/upload-resume");
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT (Blue half) */}
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
                poster="/login-left-poster.png"
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

          {/* Slider bars */}
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

          {/* Role toggle */}
          <div className="mt-6 flex justify-center gap-6">
            <button
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
              {/* keep htmlFor on a real <label>, render text with T */}
              <label htmlFor="username" className="mb-1 block">
                <T as="span" variant="body16" weight={500}>
                  Username
                </T>
              </label>
              <input
                id="username"
                name="username"
                // RULES: 3–30 chars, letters/numbers/_/., or email allowed
                pattern="^([A-Za-z0-9_.]{3,30}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$"
                title="Use an email or 3–30 characters (letters, numbers, dot or underscore)."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Enter your username or email"
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
                // RULES: at least 8 chars (add stronger rules in backend)
                minLength={8}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <T
                as="p"
                variant="sub14"
                className="mt-1 text-gray-400"
                lineHeightPx={18}
              >
                Minimum 8 characters. (Enforce complexity on the server.)
              </T>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  name="remember"
                  type="checkbox"
                  className="accent-[#4D31EC]"
                />
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
              disabled={isLoading}
              className={`w-full rounded-full py-3 text-white transition ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#4D31EC] hover:bg-[#3b25b5]"
              }`}
            >
              <T as="span" variant="button">
                {isLoading ? "Logging in..." : "Login →"}
              </T>
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3">
              <span className="h-px w-full bg-gray-200" />
              <T as="span" variant="sub14" weight={600} className="text-black">
                or continue with
              </T>
              <span className="h-px w-full bg-gray-200" />
            </div>

            {/* Social buttons with real icons */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border px-6 py-2"
                aria-label="Continue with Google"
              >
                <Image
                  src="/flat-color-icons_google.png"
                  alt="Google"
                  width={16}
                  height={16}
                />
                <T as="span" variant="sub14" weight={600}>
                  Google
                </T>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border px-6 py-2"
                aria-label="Continue with Microsoft"
              >
                <Image
                  src="/logos_microsoft-icon.png"
                  alt="Microsoft"
                  width={16}
                  height={16}
                />
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
