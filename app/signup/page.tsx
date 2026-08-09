"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: "" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper && hasLower, hasNum, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { level: 1, label: "Weak" };
  if (score === 2) return { level: 2, label: "Fair" };
  return { level: 3, label: "Strong" };
}

const STRENGTH_COLOR = ["", "#ef4444", "#f59e0b", "#10b981"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "", companyName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (role === "recruiter" && !form.companyName.trim()) { setError("Company name is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role,
          companyName: role === "recruiter" ? form.companyName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }

      const result = await signIn("credentials", { username: form.email, password: form.password, redirect: false });
      if (result?.error) { router.push("/login"); return; }
      router.push(role === "recruiter" ? "/employer" : "/onboarding/upload-resume");
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT */}
      <section className="relative hidden w-1/2 items-center justify-center bg-[#4D31EC] px-12 text-white md:flex">
        <Image src="/workcrew-icon.png" alt="WorkCrew.ai" width={116} height={21} className="absolute left-[50px] top-[50px]" priority />
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="relative aspect-[16/10] w-full">
              <video src="/videos/resume_parse.mp4" poster="/login-left-poster.png" className="absolute inset-0 h-full w-full object-cover" playsInline muted loop autoPlay controls={false} preload="metadata">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-semibold">Smart resume parsing</h2>
          <p className="mt-2 text-sm text-white/80">AI smartly extracts and organizes your skills, experience, and achievements from any resume format.</p>
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex w-full items-center justify-center px-8 py-16 md:w-1/2 md:px-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-center text-4xl font-semibold" style={{ color: "#4D31EC" }}>Create your account!</h1>
          <p className="mt-2 text-center text-gray-500">Enter your details to get started</p>

          {/* Role selector */}
          <div className="mt-6 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            {(["candidate", "recruiter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === r ? "bg-[#4D31EC] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {r === "candidate" ? "👤 Job Seeker" : "🏢 Employer / Recruiter"}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">First name</label>
              <input className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="John" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Last name</label>
              <input className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="Doe" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
            </div>

            {role === "recruiter" && (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Company name</label>
                <input className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="Acme Corp" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required={role === "recruiter"} />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Work email</label>
              <input type="email" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input type="password" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="At least 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} minLength={8} required />
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-colors duration-200"
                        style={{ background: strength.level >= n ? STRENGTH_COLOR[strength.level] : "#e5e7eb" }} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {strength.label && <span style={{ color: STRENGTH_COLOR[strength.level] }}>{strength.label}</span>}
                    {" — "}Use uppercase, numbers &amp; symbols for a stronger password.
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
              <input type="password" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#4D31EC] transition-colors" placeholder="Confirm your password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
            </div>

            <div className="md:col-span-2 space-y-3 text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-[#4D31EC]" required /> I agree to the Terms of Service and Privacy Policy
              </label>
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-[#4D31EC]" /> Send me job recommendations and career tips
              </label>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
                {loading ? "Creating account…" : role === "recruiter" ? "Create Employer Account →" : "Sign up →"}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="font-semibold text-[#4D31EC]">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
