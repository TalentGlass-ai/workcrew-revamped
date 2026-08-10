import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FlagReviewButton } from "@/workcrew-ui/components/proctoring/FlagReviewButton";

export const metadata = { title: "Flag Review – WorkCrew.ai" };

const SEV_CLS: Record<string, string> = {
  high:   "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low:    "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
};

export default async function ProctoringDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const isRecruiter =
    user.role === "recruiter" || user.role === "hiring_manager" || user.role === "admin";
  if (!isRecruiter) redirect("/dashboard");

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      candidate: { include: { user: { select: { name: true, email: true } } } },
      job: { select: { title: true } },
      assessmentAttempts: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { score: true, fraudRiskScore: true, submittedAt: true },
      },
      proctoringFlags: { orderBy: { flaggedAt: "asc" } },
      proctoringEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!assessment) notFound();

  if (user.role !== "admin" && assessment.organizationId !== user.organizationId) {
    redirect("/dashboard");
  }

  const attempt = assessment.assessmentAttempts[0];
  const riskPct = attempt?.fraudRiskScore != null ? Math.round(attempt.fraudRiskScore * 100) : null;
  const riskCls =
    (attempt?.fraudRiskScore ?? 0) >= 0.6
      ? "text-red-700 bg-red-50 ring-red-200"
      : (attempt?.fraudRiskScore ?? 0) >= 0.3
      ? "text-amber-700 bg-amber-50 ring-amber-200"
      : "text-emerald-700 bg-emerald-50 ring-emerald-200";

  const candidateName = assessment.candidate.user.name ?? assessment.candidate.user.email ?? "Unknown";
  const pendingCount = assessment.proctoringFlags.filter((f) => !f.reviewed).length;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0] px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/proctoring"
            className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
          >
            ← Proctoring Dashboard
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{candidateName}</h1>
              <p className="mt-1 text-sm text-white/70">
                {assessment.candidate.user.email} · {assessment.job?.title ?? "No job linked"} ·{" "}
                <span className="capitalize">{assessment.language}</span> ({assessment.difficulty})
              </p>
            </div>
            {riskPct != null && (
              <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ${riskCls}`}>
                {riskPct}% fraud risk
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {[
              { label: "Flags", value: assessment.proctoringFlags.length },
              { label: "Pending review", value: pendingCount },
              { label: "Events", value: assessment.proctoringEvents.length },
              { label: "Score", value: attempt?.score != null ? `${Math.round(attempt.score)}%` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 px-4 py-2">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Flags */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Proctoring Flags ({assessment.proctoringFlags.length})
          </h2>
          {assessment.proctoringFlags.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 text-center text-gray-400">
              No flags recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {assessment.proctoringFlags.map((flag) => (
                <div
                  key={flag.id}
                  className={`flex items-start justify-between gap-4 rounded-2xl border bg-white px-5 py-4 shadow-sm ${
                    flag.reviewed ? "border-gray-100 opacity-60" : "border-orange-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEV_CLS[flag.severity] ?? SEV_CLS.low}`}>
                        {flag.severity}
                      </span>
                      <time className="text-xs text-gray-400">
                        {new Date(flag.flaggedAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="text-sm text-gray-800">{flag.reason}</p>
                  </div>
                  <div className="shrink-0">
                    <FlagReviewButton flagId={flag.id} initialReviewed={flag.reviewed} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Event Timeline */}
        {assessment.proctoringEvents.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Event Timeline ({assessment.proctoringEvents.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Time</th>
                    <th className="px-5 py-3 text-left font-medium">Event</th>
                    <th className="px-5 py-3 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assessment.proctoringEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap font-mono tabular-nums">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium capitalize">
                        {evt.eventType.replace(/_/g, " ")}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">
                        {evt.details ? JSON.stringify(evt.details) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
