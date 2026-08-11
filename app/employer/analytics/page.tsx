"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Summary = { publishedJobs: number; total: number; active: number; hired: number; rejected: number; withdrawn: number; avgDaysToHire: number | null };
type FunnelRow = { stage: string; count: number };
type JobRow = { id: string; title: string; total: number; active: number; hired: number; rejected: number };
type WeekRow = { label: string; count: number };

const STAGE_COLOR: Record<string, string> = {
  applied:   "bg-blue-400",
  screening: "bg-yellow-400",
  interview: "bg-purple-400",
  offer:     "bg-emerald-400",
  hired:     "bg-emerald-600",
};

const STAGE_LABEL: Record<string, string> = {
  applied: "Applied", screening: "Screening", interview: "Interview", offer: "Offer", hired: "Hired",
};

export default function EmployerAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [byJob, setByJob] = useState<JobRow[]>([]);
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/employer/analytics")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setSummary(d.summary);
        setFunnel(d.funnel);
        setByJob(d.byJob);
        setWeeks(d.weeks);
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading analytics…</p>
      </main>
    );
  }

  const funnelMax = Math.max(...funnel.map(f => f.count), 1);
  const weekMax = Math.max(...weeks.map(w => w.count), 1);
  const hireRate = summary && (summary.hired + summary.rejected) > 0
    ? Math.round((summary.hired / (summary.hired + summary.rejected)) * 100)
    : null;
  // Conversion rate from each stage to the next (using applied count as base)
  const appliedCount = funnel.find(f => f.stage === "applied")?.count ?? 0;
  const conversionRate = (count: number) =>
    appliedCount > 0 ? Math.round((count / appliedCount) * 100) : null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/employer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Employer dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hiring Analytics</h1>
          <p className="mt-0.5 text-sm text-gray-500">Pipeline performance across all your jobs</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6 space-y-6">
        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Live jobs",          value: summary.publishedJobs,                                    color: "text-gray-900" },
              { label: "Total applicants",   value: summary.total,                                            color: "text-[#4D31EC]" },
              { label: "Active in pipeline", value: summary.active,                                           color: "text-emerald-600" },
              { label: "Withdrawn",          value: summary.withdrawn,                                        color: "text-amber-600" },
              { label: "Hire rate",          value: hireRate != null ? `${hireRate}%` : "—",                 color: "text-emerald-700" },
              { label: "Avg days to hire",   value: summary.avgDaysToHire != null ? `${summary.avgDaysToHire}d` : "—", color: "text-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pipeline funnel */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Pipeline distribution</h2>
            {summary?.total === 0 ? (
              <p className="text-sm text-gray-400">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {funnel.map(({ stage, count }) => {
                  const conv = stage !== "applied" ? conversionRate(count) : null;
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="w-20 flex-shrink-0 text-xs text-gray-500 text-right">{STAGE_LABEL[stage]}</span>
                      <div className="flex-1 rounded-full bg-gray-100 h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${STAGE_COLOR[stage] ?? "bg-gray-400"}`}
                          style={{ width: `${Math.round((count / funnelMax) * 100)}%` }}
                        />
                      </div>
                      <span className="w-6 flex-shrink-0 text-xs font-semibold text-gray-700 text-right">{count}</span>
                      <span className="w-12 flex-shrink-0 text-right">
                        {conv != null
                          ? <span className={`text-[10px] font-semibold ${conv >= 30 ? "text-emerald-600" : "text-gray-400"}`}>{conv}%</span>
                          : <span className="text-[10px] text-gray-300">—</span>}
                      </span>
                    </div>
                  );
                })}
                <p className="text-[10px] text-gray-400 mt-1">% column = share of applied candidates reaching each stage</p>
              </div>
            )}
          </div>

          {/* Weekly volume */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Applications — last 8 weeks</h2>
            {summary?.total === 0 ? (
              <p className="text-sm text-gray-400">No applications yet.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-32">
                {weeks.map(({ label, count }) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 font-medium">{count || ""}</span>
                    <div className="w-full rounded-t-md bg-gray-100 flex items-end" style={{ height: "80px" }}>
                      <div
                        className="w-full rounded-t-md bg-[#4D31EC]/80 transition-all"
                        style={{ height: `${Math.round((count / weekMax) * 80)}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Per-job table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">By job</h2>
          </div>
          {byJob.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400">No jobs with applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-semibold">
                    <th className="px-6 py-3 text-left">Job</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Active</th>
                    <th className="px-4 py-3 text-right">Hired</th>
                    <th className="px-4 py-3 text-right">Rejected</th>
                    <th className="px-4 py-3 text-right">Hire rate</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {byJob.map(j => {
                    const rate = (j.hired + j.rejected) > 0
                      ? Math.round((j.hired / (j.hired + j.rejected)) * 100)
                      : null;
                    return (
                      <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{j.title}</td>
                        <td className="px-4 py-3 text-right text-gray-700 font-semibold">{j.total}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{j.active}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{j.hired}</td>
                        <td className="px-4 py-3 text-right text-red-400">{j.rejected}</td>
                        <td className="px-4 py-3 text-right">
                          {rate != null
                            ? <span className={`font-semibold ${rate >= 20 ? "text-emerald-600" : "text-gray-400"}`}>{rate}%</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/employer/jobs/${j.id}`} className="text-xs font-semibold text-[#4D31EC] hover:underline">
                            Pipeline →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
