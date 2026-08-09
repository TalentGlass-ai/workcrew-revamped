"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (e.currentTarget.elements.namedItem("confirm") as HTMLInputElement).value;
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try requesting a new link.");
    }
  }

  if (!token) return (
    <p className="text-center text-red-600">Invalid reset link. <Link href="/forgot-password" className="text-[#4D31EC]">Request a new one.</Link></p>
  );

  if (done) return (
    <div className="rounded-xl bg-green-50 p-6 text-center">
      <p className="text-green-700 font-medium">Password updated! Redirecting to login…</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input name="password" type="password" placeholder="New password (min 8 chars)" required minLength={8}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]" />
      <input name="confirm" type="password" placeholder="Confirm new password" required minLength={8}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60">
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center" style={{ color: "#4D31EC" }}>
          Set a new password
        </h1>
        <Suspense fallback={<p className="text-center text-gray-500 mt-8">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
