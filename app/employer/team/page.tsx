"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { can } from "../../../lib/capabilities";

type Member = { id: string; name: string | null; email: string | null; role: string; createdAt: string };
type Invite = { id: string; email: string; role: string; expires: string; createdAt: string };
type Seats = { used: number; limit: number | null; plan: string };

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin", recruiter: "Recruiter", hiring_manager: "Hiring manager", interviewer: "Interviewer",
};
const ROLE_COLOR: Record<string, string> = {
  admin: "bg-[#4D31EC]/10 text-[#4D31EC]",
  recruiter: "bg-blue-50 text-blue-700",
  hiring_manager: "bg-emerald-50 text-emerald-700",
  interviewer: "bg-amber-50 text-amber-700",
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canManageTeam = can((session?.user as { role?: string } | undefined)?.role, "manageTeam");

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [seats, setSeats] = useState<Seats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("recruiter");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const seatsFull = !!seats && seats.limit !== null && seats.used >= seats.limit;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function load() {
    fetch("/api/employer/team")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setMembers(d.members ?? []);
        setInvites(d.invites ?? []);
        setSeats(d.seats ?? null);
        setCurrentUserId(d.currentUserId ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
  }, [status]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    const res = await fetch("/api/employer/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setSending(false);
    if (res.ok) {
      setMsg({ kind: "ok", text: `Invite sent to ${email}` });
      setEmail("");
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg({ kind: "err", text: d.error ?? "Failed to send invite" });
    }
  }

  async function revoke(id: string) {
    setInvites(prev => prev.filter(i => i.id !== id));
    await fetch(`/api/employer/team?inviteId=${id}`, { method: "DELETE" }).catch(() => null);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading team…</p>
      </main>
    );
  }

  const inp = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Employer dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Team</h1>
          <p className="mt-0.5 text-sm text-gray-500">Invite colleagues to collaborate on hiring</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6 space-y-6">
        {/* Invite form */}
        {canManageTeam && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-800">Invite a teammate</h2>
            {seats && (
              <span className="text-xs font-medium text-gray-400">
                {seats.limit === null
                  ? `${seats.used} seat${seats.used !== 1 ? "s" : ""} used`
                  : `${seats.used} of ${seats.limit} seats used`}
              </span>
            )}
          </div>

          {seatsFull && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                You've used all {seats!.limit} seats on the <span className="font-semibold capitalize">{seats!.plan}</span> plan.
              </p>
              <Link href="/billing" className="flex-shrink-0 rounded-lg bg-[#4D31EC] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                Upgrade →
              </Link>
            </div>
          )}

          <form onSubmit={invite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com" className={inp} />
            </div>
            <div className="sm:w-52">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className={inp}>
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring manager</option>
                <option value="interviewer">Interviewer</option>
              </select>
            </div>
            <button type="submit" disabled={sending || seatsFull}
              title={seatsFull ? "Seat limit reached — upgrade to invite more" : undefined}
              className="rounded-lg bg-[#4D31EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
              {sending ? "Sending…" : "Send invite"}
            </button>
          </form>
          {msg && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {msg.text}
            </p>
          )}
        </div>
        )}

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Pending invites ({invites.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {invites.map(i => (
                <div key={i.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{i.email}</p>
                    <p className="text-xs text-gray-400">
                      Expires {new Date(i.expires).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLOR[i.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABEL[i.role] ?? i.role}
                    </span>
                    {canManageTeam && (
                      <button onClick={() => revoke(i.id)}
                        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Members ({members.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {m.name ?? "—"}
                    {m.id === currentUserId && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLOR[m.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
