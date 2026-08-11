"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Alert = {
  id: string;
  query: string | null;
  location: string | null;
  jobType: string | null;
  skills: string[];
  frequency: string;
  lastSentAt: string | null;
  createdAt: string;
};

const JOB_TYPES = ["", "full-time", "part-time", "contract", "internship"];
const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all";

function alertLabel(a: Alert): string {
  const parts: string[] = [];
  if (a.query) parts.push(`"${a.query}"`);
  if (a.location) parts.push(a.location);
  if (a.jobType) parts.push(a.jobType);
  if (a.skills.length) parts.push(a.skills.slice(0, 3).join(", "));
  return parts.length ? parts.join(" · ") : "All jobs";
}

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // form state
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [skillsRaw, setSkillsRaw] = useState("");
  const [frequency, setFrequency] = useState("daily");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const load = () =>
    fetch("/api/job-alerts")
      .then((r) => r.ok ? r.json() : { alerts: [] })
      .then((d) => setAlerts(d.alerts ?? []))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    await fetch("/api/job-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query || null, location: location || null, jobType: jobType || null, skills, frequency }),
    });
    setSubmitting(false);
    setShowForm(false);
    setQuery(""); setLocation(""); setJobType(""); setSkillsRaw(""); setFrequency("daily");
    setLoading(true);
    load();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/job-alerts?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (status === "loading") return null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Dashboard
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
              <p className="mt-0.5 text-sm text-gray-500">Get notified when new jobs match your criteria.</p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-[#4D31EC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors flex-shrink-0"
            >
              {showForm ? "Cancel" : "+ New alert"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6 space-y-4">
        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800">New job alert</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Keywords</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. React, backend, designer"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, New York"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Job type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={INPUT}>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>{t || "Any"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={INPUT}>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Skills (comma-separated)</label>
              <input
                value={skillsRaw}
                onChange={(e) => setSkillsRaw(e.target.value)}
                placeholder="e.g. TypeScript, Node.js, PostgreSQL"
                className={INPUT}
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors"
              >
                {submitting ? "Saving…" : "Create alert"}
              </button>
            </div>
          </form>
        )}

        {/* Alert list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">No alerts yet</p>
            <p className="mt-1 text-sm text-gray-400">Create an alert and we'll email you when matching jobs appear.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-lg bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] transition-colors"
            >
              + New alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{alertLabel(a)}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#4D31EC]/10 px-2 py-0.5 text-xs font-medium text-[#4D31EC] capitalize">
                      {a.frequency}
                    </span>
                    {a.skills.map((s) => (
                      <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {a.lastSentAt
                      ? `Last sent ${new Date(a.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Not yet sent"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                  {deleting === a.id ? "…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
