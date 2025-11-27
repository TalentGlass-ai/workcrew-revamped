// app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import T from "../../workcrew-ui/components/primitives/Typography";
import { CandidateAuth, RecruiterAuth } from "../../workcrew-ui/lib/endpoints";

declare global {
  interface Window {
    google?: any;
  }
}

// IMPORTANT: set NEXT_PUBLIC_GOOGLE_ID in your Next.js .env.local
// It should match backend GOOGLE_ID
const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole =
    (searchParams.get("role") === "candidate" ? "candidate" : "employer") as
      | "candidate"
      | "employer";

  const [role, setRole] = React.useState<"candidate" | "employer">(initialRole);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [gsiReady, setGsiReady] = React.useState(false);

  // Load Google Identity Services once on client
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setGsiReady(true);
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setGsiReady(true);
    s.onerror = () => setGsiReady(false);
    document.head.appendChild(s);

    // no cleanup needed for script
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "").trim();

    try {
      if (role === "candidate") {
        const res = await CandidateAuth.login({ email: username, password });
        const data = res.data;
        const token =
          data?.token ?? data?.accessToken ?? data?.data?.token ?? null;

        if (!token) {
          setError("Login succeeded but token was not returned by the server.");
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("wc_token", token);
          if (data?.candidate) {
            localStorage.setItem("wc_candidate", JSON.stringify(data.candidate));
            localStorage.removeItem("wc_recruiter");
          }
        }

        router.push("/onboarding/upload-resume");
      } else {
        const res = await RecruiterAuth.login({ email: username, password });
        const data = res.data;
        const token =
          data?.token ?? data?.accessToken ?? data?.data?.token ?? null;

        if (!token) {
          setError("Login succeeded but token was not returned by the server.");
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("wc_token", token);
          if (data?.recruiter) {
            localStorage.setItem("wc_recruiter", JSON.stringify(data.recruiter));
            localStorage.removeItem("wc_candidate");
          }
        }

        router.push("/onboarding-employer/company");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Google Sign-In (candidate only, uses existing /google-auth backend)
  async function handleGoogleClick() {
    setError(null);

    if (role !== "candidate") {
      setError("Google Sign-In is available for candidates only.");
      return;
    }

    if (!GOOGLE_ID) {
      setError("Google Client ID is not configured on the frontend.");
      return;
    }

    if (!gsiReady || !window.google?.accounts?.id) {
      setError("Google Sign-In is not ready. Please try again.");
      return;
    }

    try {
      await new Promise<void>((resolve) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_ID,
          callback: async (resp: { credential: string }) => {
            try {
              const idToken = resp?.credential;
              if (!idToken) {
                setError("Google did not return a credential.");
                resolve();
                return;
              }

              // This hits backend routes/auth.js -> controller/googleAuth.js
              const r = await CandidateAuth.googleAuth({
                token: idToken,
                userType: "candidate",
              });

              const data = r.data;
              const token =
                data?.token ?? data?.accessToken ?? data?.data?.token ?? null;

              if (!token) {
                setError(
                  "Login succeeded but token was not returned by the server."
                );
                resolve();
                return;
              }

              if (typeof window !== "undefined") {
                localStorage.setItem("wc_token", token);
                if (data?.data) {
                  localStorage.setItem("wc_candidate", JSON.stringify(data.data));
                  localStorage.removeItem("wc_recruiter");
                }
              }

              router.push("/onboarding/upload-resume");
            } catch (e: any) {
              setError(
                e?.response?.data?.message ||
                  e?.message ||
                  "Google login failed. Please try again."
              );
            } finally {
              resolve();
            }
          },
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger the popup
        window.google.accounts.id.prompt(() => resolve());
      });
    } catch (e: any) {
      setError(e?.message || "Could not start Google Sign-In.");
    }
  }

  return (
    // Left side fixed, right side scrolls
    <main className="flex h-screen bg-white overflow-hidden">
      {/* LEFT: static illustration (desktop only) */}
      <section className="relative hidden h-full w-1/2 items-center justify-center bg-[#4D31EC] px-12 text-white md:flex">
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

      {/* RIGHT: scrollable login column */}
      <section className="flex h-full w-full items-center justify-center px-8 py-10 md:w-1/2 md:px-24 overflow-y-auto">
        <div className="w-full max-w-lg pb-10">
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

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

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
                pattern="^([A-Za-z0-9_.]{3,30}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
                title="Use an email or 3–30 characters (letters, numbers, dot or underscore)."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder={
                  role === "employer"
                    ? "you@company.com"
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
              disabled={loading}
              className="h-12 w-full rounded-full bg-[#4D31EC] text-white transition hover:bg-[#3b25b5] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <T as="span" variant="button">
                {loading ? "Logging in..." : "Login →"}
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
                onClick={handleGoogleClick}
                disabled={!gsiReady || role !== "candidate"}
                className="flex items-center justify-center gap-2 rounded-full border px-6 py-2 disabled:opacity-60"
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
              <Link
                href={
                  role === "employer"
                    ? "/onboarding-employer/signup"
                    : "/signup"
                }
                className="font-semibold text-[#4D31EC]"
              >
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
