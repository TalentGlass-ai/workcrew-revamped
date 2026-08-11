"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setName(d.name ?? ""); setEmail(d.email ?? ""); } });
  }, [status]);

  if (status === "loading") return null;

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const d = await r.json();
      if (r.ok) {
        await update({ name: d.name });
        setProfileMsg({ ok: true, text: "Profile updated." });
      } else {
        setProfileMsg({ ok: false, text: d.error ?? "Failed to update profile." });
      }
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await r.json();
      if (r.ok) {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        setPwMsg({ ok: true, text: "Password changed successfully." });
      } else {
        setPwMsg({ ok: false, text: d.error ?? "Failed to change password." });
      }
    } finally {
      setPwSaving(false);
    }
  }

  const isEmployer = (session?.user as any)?.role === "recruiter";
  const backHref = isEmployer ? "/employer/dashboard" : "/dashboard";

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href={backHref} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your profile and password.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Profile */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
            </div>
            {profileMsg && (
              <p className={`text-sm font-medium ${profileMsg.ok ? "text-emerald-600" : "text-red-600"}`}>
                {profileMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors"
            >
              {profileSaving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20"
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 8 characters.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20"
              />
            </div>
            {pwMsg && (
              <p className={`text-sm font-medium ${pwMsg.ok ? "text-emerald-600" : "text-red-600"}`}>
                {pwMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={pwSaving}
              className="rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors"
            >
              {pwSaving ? "Updating…" : "Change password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
