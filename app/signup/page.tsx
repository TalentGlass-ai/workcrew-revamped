"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { CandidateAuth } from "../../workcrew-ui/lib/endpoints";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6 &&
    password === confirm &&
    agree;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();

      await CandidateAuth.signup({
        name,
        email: email.trim(),
        password,
        userType: "candidate",
      });

      const res = await CandidateAuth.login({
        email: email.trim(),
        password,
      });

      const data = res.data;
      const token =
        data?.token ?? data?.accessToken ?? data?.data?.token ?? null;

      if (!token) {
        setError("Signed up, but login did not return a token.");
        setSubmitting(false);
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
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sign up failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen">
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

          <h2 className="mt-2 text-2xl font-semibold">Smart resume parsing</h2>
          <p className="mt-2 text-sm text-white/80">
            AI smartly extracts and organizes your skills, experience, and achievements from any resume format.
          </p>

          <div className="mt-8 flex gap-2">
            <div className="h-1.5 w-16 rounded-full bg-white" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center px-8 py-16 md:w-1/2 md:px-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-center text-4xl font-semibold" style={{ color: "#4D31EC" }}>
            Create your account!
          </h1>
          <p className="mt-2 text-center text-gray-500">Enter your details to sign up</p>

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">First name</label>
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Eg: John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Last name</label>
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Eg: Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">Confirm password</label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="md:col-span-2 space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#4D31EC]"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#4D31EC]"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                Send me job recommendations and career tips
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Signing up..." : "Sign up →"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
