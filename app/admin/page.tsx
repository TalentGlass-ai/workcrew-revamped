"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Summary = {
  totalUsers: number; newUsers30d: number;
  totalCandidates: number; totalOrgs: number;
  totalJobs: number; liveJobs: number;
  totalApplications: number; applications30d: number;
  totalHired: number; totalAssessments: number;
  apps7d: number; appGrowth: number | null;
};
type RecentUser = { id: string; name: string | null; email: string | null; role: string; createdAt: string; organizationId: string | null };
type GroupRow = { status?: string; currentStage?: string; _count: { id: number } };
type DayRow = { day: string; count: number };

const ROLE_COLOR: Record<string, string> = {
  admin:     "bg-red-50 text-red-700",
  recruiter: "bg-blue-50 text-blue-700",
  candidate: "bg-gray-100 text-gray-600",
};

const STAGE_COLOR: Record<string, string> = {
  applied:   "bg-blue-400",
  screening: "bg-yellow-400",
  interview: "bg-purple-400",
  offer:     "bg-emerald-400",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [jobsByStatus, setJobsByStatus] = useState<GroupRow[]>([]);
  const [appsByStage, setAppsByStage] = useState<GroupRow[]>([]);
  const [dailySignups, setDailySignups] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/stats")
      .then(r => { if (r.status === 403) { setForbidden(true); return null; } return r.ok ? r.json() : null; })
      .then(d => {
        if (!d) return;
        setSummary(d.summary);
        setRecentUsers(d.recentUsers ?? []);
        setJobsByStatus(d.jobsByStatus ?? []);
        setAppsByStage(d.appsByStage ?? []);
        setDailySignups(d.dailySignups ?? []);
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></main>;
  }

  if (forbidden) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">Access denied</p>
          <p className="mt-2 text-sm text-gray-400">This page requires admin role.</p>
        </div>
      </main>
    );
  }

  const hireRate = summary && (summary.totalHired + (summary.totalApplications - summary.totalHired)) > 0
    ? Math.round((summary.totalHired / summary.totalApplications) * 100)
    : null;

  const sigMax = Math.max(...dailySignups.map(d => d.count), 1);
  const stageMax = Math.max(...appsByStage.map(r => r._count.id), 1);

  const STAT_CARDS = summary ? [
    { label: "Total users",       value: summary.totalUsers,        sub: `+${summary.newUsers30d} last 30d`,    color: "text-gray-900" },
    { label: "Candidates",        value: summary.totalCandidates,   sub: `${summary.totalOrgs} orgs`,            color: "text-[#4D31EC]" },
    { label: "Live jobs",         value: summary.liveJobs,          sub: `${summary.totalJobs} total`,           color: "text-emerald-600" },
    { label: "Applications",      value: summary.totalApplications, sub: `+${summary.applications30d} last 30d`, color: "text-[#4D31EC]" },
    { label: "Hired",             value: summary.totalHired,        sub: hireRate != null ? `${hireRate}% hire rate` : "",  color: "text-emerald-700" },
    { label: "Assessments sent",  value: summary.totalAssessments,  sub: "",                                     color: "text-purple-700" },
    { label: "Apps this week",    value: summary.apps7d,            sub: summary.appGrowth != null ? `${summary.appGrowth > 0 ? "+" : ""}${summary.appGrowth}% vs last week` : "", color: summary.appGrowth != null && summary.appGrowth >= 0 ? "text-emerald-600" : "text-red-500" },
    { label: "Organisations",     value: summary.totalOrgs,         sub: "",                                     color: "text-gray-900" },
  ] : [];

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4D31EC]">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Logged in as {session?.user?.email}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_CARDS.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value.toLocaleString()}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              {sub && <p className="mt-1 text-[10px] text-gray-400">{sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily signups sparkline */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">New users — last 14 days</h2>
            {dailySignups.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="flex items-end gap-1 h-28">
                {dailySignups.map(({ day, count }) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                    <span className="text-[9px] text-gray-400 font-medium">{count || ""}</span>
                    <div className="w-full rounded-t-sm bg-gray-100" style={{ height: "80px", display: "flex", alignItems: "flex-end" }}>
                      <div className="w-full rounded-t-sm bg-[#4D31EC]/80 transition-all"
                        style={{ height: `${Math.round((count / sigMax) * 80)}px` }} />
                    </div>
                    <span className="text-[8px] text-gray-300 whitespace-nowrap truncate w-full text-center">
                      {new Date(day).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active pipeline stages */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Active pipeline by stage</h2>
            {appsByStage.length === 0 ? (
              <p className="text-sm text-gray-400">No active applications.</p>
            ) : (
              <div className="space-y-3">
                {[...appsByStage].sort((a, b) => b._count.id - a._count.id).map(row => {
                  const stage = row.currentStage ?? "unknown";
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="w-20 flex-shrink-0 text-right text-xs capitalize text-gray-500">{stage}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${STAGE_COLOR[stage] ?? "bg-gray-400"}`}
                          style={{ width: `${Math.round((row._count.id / stageMax) * 100)}%` }} />
                      </div>
                      <span className="w-8 flex-shrink-0 text-right text-xs font-semibold text-gray-700">{row._count.id}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Jobs by status */}
        <div className="grid gap-3 sm:grid-cols-4">
          {jobsByStatus.map(row => {
            const s = row.status ?? "unknown";
            const colors: Record<string, string> = {
              published: "border-emerald-200 bg-emerald-50 text-emerald-700",
              draft:     "border-gray-200 bg-gray-50 text-gray-600",
              closed:    "border-amber-200 bg-amber-50 text-amber-700",
              archived:  "border-red-100 bg-red-50 text-red-600",
            };
            return (
              <div key={s} className={`rounded-xl border p-4 ${colors[s] ?? "border-gray-100 bg-white text-gray-600"}`}>
                <p className="text-2xl font-bold tabular-nums">{row._count.id}</p>
                <p className="mt-0.5 text-xs font-semibold capitalize">{s} jobs</p>
              </div>
            );
          })}
        </div>

        {/* Recent signups */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Recent signups</h2>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Org</th>
                    <th className="px-4 py-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{u.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[180px]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[u.role] ?? ROLE_COLOR.candidate}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.organizationId ? "✓ org" : "—"}</td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
