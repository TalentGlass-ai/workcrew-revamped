// PATH: app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import T from "@/components/primitives/Typography";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid credentials", { description: "Please check your username and password." });
      return;
    }

    toast.success("Login successful!");

    // Read the actual DB role from the session JWT — never trust client-side state
    const session = await getSession();
    const role = (session?.user as any)?.role ?? "candidate";
    router.push(role === "recruiter" || role === "admin" ? "/employer" : "/dashboard");
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="mb-1 block">
                <T as="span" variant="body16" weight={500}>
                  Email
                </T>
              </label>
              <input
                id="username"
                name="username"
                type="email"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC] transition-colors"
                placeholder="you@example.com"
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC] transition-colors"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-end">
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
                {isLoading ? "Logging in…" : "Login →"}
              </T>
            </button>

            <T as="p" variant="sub14" className="text-center">
              Don't have an account?{" "}
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
