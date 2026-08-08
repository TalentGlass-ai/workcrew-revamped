"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center" style={{ color: "#4D31EC" }}>
          Reset your password
        </h1>

        {submitted ? (
          <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
            <p className="text-green-700 font-medium">
              If that email is registered, you'll receive a reset link shortly.
            </p>
            <Link href="/login" className="mt-4 inline-block text-[#4D31EC] font-semibold">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-gray-500">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="text-[#4D31EC] font-semibold">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
