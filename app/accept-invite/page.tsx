"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

type Invite = { email: string; role: string; orgName: string };

const ROLE_LABEL: Record<string, string> = {
  recruiter: "Recruiter", hiring_manager: "Hiring manager", interviewer: "Interviewer",
};

function AcceptInviteInner() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [invite, setInvite] = useState<Invite | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setInvalid(true); return; }
    fetch(`/api/invite/${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.invite) setInvite(d.invite); else setInvalid(true); })
      .catch(() => setInvalid(true));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/invite/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, password }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to accept invite");
    }
  }

  if (invalid) {
    return (
      <div className="text-center">
        <p className="text-xl font-bold text-gray-800">Invite not valid</p>
        <p className="mt-2 text-sm text-gray-400">This invite is invalid or has expired. Ask your teammate to send a new one.</p>
        <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-[#4D31EC] hover:underline">
          Go to sign in →
        </Link>
      </div>
    );
  }

  if (!invite) {
    return <p className="text-sm text-gray-400">Loading invite…</p>;
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-xl font-bold text-emerald-700">Welcome to {invite.orgName} 🎉</p>
        <p className="mt-2 text-sm text-gray-500">Your account is ready. Redirecting you to sign in…</p>
      </div>
    );
  }

  const inp = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Join {invite.orgName}</h1>
      <p className="mt-1 text-sm text-gray-500">
        You're invited as a <strong>{ROLE_LABEL[invite.role] ?? invite.role}</strong>. Set up your account for <strong>{invite.email}</strong>.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">First name</label>
            <input required value={firstName} onChange={e => setFirstName(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Last name</label>
            <input required value={lastName} onChange={e => setLastName(e.target.value)} className={inp} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Password</label>
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters" className={inp} />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
          {submitting ? "Setting up…" : "Accept & create account"}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center px-6 py-12">
      <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
        <AcceptInviteInner />
      </Suspense>
    </main>
  );
}
