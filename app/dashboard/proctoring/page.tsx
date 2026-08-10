import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Proctoring Dashboard – WorkCrew.ai" };

const SEV_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function riskBadge(score: number | null | undefined) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const cls =
    score >= 0.6
      ? "bg-red-50 text-red-700 ring-red-200"
      : score >= 0.3
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return { pct, cls };
}

export default async function ProctoringDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const isRecruiter =
    user.role === "recruiter" ||
    user.role === "hiring_manager" ||
    user.role === "admin";
  if (!isRecruiter) redirect("/dashboard");

  const assessments = await prisma.assessment.findMany({
    where: {
      organizationId: user.organizationId,
      proctoringFlags: { some: {} },
    },
    include: {
      candidate: { include: { user: { select: { name: true, email: true } } } },
      job: { select: { title: true } },
      assessmentAttempts: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { score: true, fraudRiskScore: true, submittedAt: true },
      },
      proctoringFlags: { select: { severity: true, reviewed: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Sort: highest fraud risk first
  assessments.sort((a, b) => {
    const ra = a.assessmentAttempts[0]?.fraudRiskScore ?? 0;
    const rb = b.assessmentAttempts[0]?.fraudRiskScore ?? 0;
    return rb - ra;
  });

  const unreviewed = assessments.filter((a) =>
    a.proctoringFlags.some((f) => !f.reviewed)
  );
  const reviewed = assessments.filter((a) =>
    a.proctoringFlags.every((f) => f.reviewed)
  );

  function FlagPills({ flags }: { flags: { severity: string; reviewed: boolean }[] }) {
    const counts: Record<string, { total: number; pending: number }> = {};
    for (const f of flags) {
      if (!counts[f.severity]) counts[f.severity] = { total: 0, pending: 0 };
      counts[f.severity].total++;
      if (!f.reviewed) counts[f.severity].pending++;
    }
    const SEV_CLS: Record<string, string> = {
      high:   "bg-red-50 text-red-700 ring-1 ring-red-200",
      medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      low:    "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
    };
    return (
      <span className="flex gap-1 flex-wrap">
        {Object.entries(counts)
          .sort(([a], [b]) => (SEV_ORDER[a] ?? 9) - (SEV_ORDER[b] ?? 9))
          .map(([sev, { total, pending }]) => (
            <span key={sev} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SEV_CLS[sev]}`}>
              {sev} ×{total}{pending > 0 && <span className="ml-0.5 rounded-full bg-current/20 px-1">{pending} new</span>}
            </span>
          ))}
      </span>
    );
  }

  function Row({ a }: { a: (typeof assessments)[number] }) {
    const attempt = a.assessmentAttempts[0];
    const risk = riskBadge(attempt?.fraudRiskScore);
    const candidateName = a.candidate.user.name ?? a.candidate.user.email ?? "Unknown";
    const pendingCount = a.proctoringFlags.filter((f) => !f.reviewed).length;
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-5 py-4">
          <p className="font-medium text-gray-900">{candidateName}</p>
          <p className="text-xs text-gray-400">{a.candidate.user.email}</p>
        </td>
        <td className="px-5 py-4 text-sm text-gray-600">{a.job?.title ?? "—"}</td>
        <td className="px-5 py-4 text-sm text-gray-500 capitalize">{a.language} · {a.difficulty}</td>
        <td className="px-5 py-4">
          {risk ? (
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${risk.cls}`}>
              {risk.pct}%
            </span>
          ) : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-5 py-4">
          <FlagPills flags={a.proctoringFlags} />
        </td>
        <td className="px-5 py-4 text-right">
          <Link
            href={`/dashboard/proctoring/${a.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors"
          >
            Review{pendingCount > 0 && ` (${pendingCount})`}
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0] px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Recruiter</p>
              <h1 className="mt-1 text-3xl font-bold">Proctoring Dashboard</h1>
              <p className="mt-2 text-sm text-white/70">
                {unreviewed.length} assessment{unreviewed.length !== 1 ? "s" : ""} with unreviewed flags
              </p>
            </div>
            <Link href="/dashboard" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* Summary chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "Pending review", value: unreviewed.length, color: "bg-white/20" },
              { label: "Cleared", value: reviewed.length, color: "bg-white/10" },
              {
                label: "High risk",
                value: assessments.filter((a) => (a.assessmentAttempts[0]?.fraudRiskScore ?? 0) >= 0.6).length,
                color: "bg-red-500/30",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl px-4 py-2 ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {assessments.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-8 py-16 text-center text-gray-400">
            No flagged assessments yet.
          </div>
        ) : (
          <>
            {/* Pending */}
            {unreviewed.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Needs review ({unreviewed.length})
                </h2>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                      <tr>
                        {["Candidate", "Job", "Assessment", "Fraud risk", "Flags", ""].map((h) => (
                          <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {unreviewed.map((a) => <Row key={a.id} a={a} />)}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Cleared */}
            {reviewed.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Cleared ({reviewed.length})
                </h2>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm opacity-70">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                      <tr>
                        {["Candidate", "Job", "Assessment", "Fraud risk", "Flags", ""].map((h) => (
                          <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reviewed.map((a) => <Row key={a.id} a={a} />)}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
