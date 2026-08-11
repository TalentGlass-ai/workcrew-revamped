"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

type Skill = {
  skillName: string;
  category: string | null;
  source: string | null;
  isValidated: boolean;
  score: number | null;
};

const POPULAR = [
  "JavaScript", "TypeScript", "Python", "React", "Node.js",
  "SQL", "Git", "Docker", "AWS", "Figma",
  "Product Management", "Data Analysis", "Machine Learning", "Go", "Java",
];

const SOURCE_LABEL: Record<string, string> = {
  assessment: "Assessed",
  resume: "Resume",
  github: "GitHub",
  self_reported: "Self-reported",
};

const SOURCE_COLOR: Record<string, string> = {
  assessment: "bg-purple-50 text-purple-700",
  resume: "bg-blue-50 text-blue-700",
  github: "bg-gray-100 text-gray-700",
  self_reported: "bg-gray-100 text-gray-500",
};

export default function SkillsPage() {
  const { status } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/skills")
      .then((r) => r.ok ? r.json() : { skills: [] })
      .then((d) => setSkills(d.skills ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  async function addSkill(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.skillName.toLowerCase() === trimmed.toLowerCase())) {
      setInput("");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const r = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: trimmed }),
      });
      if (!r.ok) { setError("Failed to add skill."); return; }
      setSkills((prev) => [...prev, { skillName: trimmed, category: "technical", source: "self_reported", isValidated: false, score: null }]);
      setInput("");
    } finally {
      setAdding(false);
    }
  }

  async function removeSkill(skillName: string) {
    setRemoving(skillName);
    await fetch("/api/skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName }),
    }).catch(() => null);
    setSkills((prev) => prev.filter((s) => s.skillName !== skillName));
    setRemoving(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); addSkill(input); }
  }

  if (status === "loading" || loading) return null;

  const selfReported = skills.filter((s) => s.source === "self_reported" || !s.source);
  const verified = skills.filter((s) => s.source && s.source !== "self_reported");
  const popularToShow = POPULAR.filter((p) => !skills.some((s) => s.skillName.toLowerCase() === p.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Skills</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Add your skills so recruiters and job recommendations can match you accurately.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Add skill */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Add a skill</h2>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. React, Python, Figma…"
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#4D31EC] focus:outline-none focus:ring-2 focus:ring-[#4D31EC]/20"
            />
            <button
              onClick={() => addSkill(input)}
              disabled={adding || !input.trim()}
              className="rounded-lg bg-[#4D31EC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {popularToShow.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-gray-400">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {popularToShow.slice(0, 10).map((p) => (
                  <button
                    key={p}
                    onClick={() => addSkill(p)}
                    disabled={adding}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:border-[#4D31EC]/40 hover:bg-[#4D31EC]/5 hover:text-[#4D31EC] disabled:opacity-50 transition-colors"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Verified skills (from assessments / resume / github) */}
        {verified.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Verified skills</h2>
            <div className="flex flex-wrap gap-2">
              {verified.map((s) => (
                <div key={s.skillName}
                  className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-800">{s.skillName}</span>
                  {s.isValidated && (
                    <span className="text-[10px] font-semibold text-purple-600">✓</span>
                  )}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_COLOR[s.source ?? ""] ?? "bg-gray-100 text-gray-500"}`}>
                    {SOURCE_LABEL[s.source ?? ""] ?? s.source}
                  </span>
                  <button
                    onClick={() => removeSkill(s.skillName)}
                    disabled={removing === s.skillName}
                    className="ml-1 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${s.skillName}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Self-reported skills */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Your skills
            {skills.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{skills.length} total</span>
            )}
          </h2>

          {skills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <p className="text-sm text-gray-400">No skills yet — add some above to improve your matches.</p>
            </div>
          ) : selfReported.length === 0 ? (
            <p className="text-sm text-gray-400">All skills are verified — nice work!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selfReported.map((s) => (
                <div key={s.skillName}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                  <span className="text-sm text-gray-800">{s.skillName}</span>
                  <button
                    onClick={() => removeSkill(s.skillName)}
                    disabled={removing === s.skillName}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${s.skillName}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-gray-400">
          Skills marked ✓ are verified by assessment results.{" "}
          <Link href="/assessments" className="text-[#4D31EC] hover:underline">
            Take an assessment →
          </Link>
        </p>
      </div>
    </main>
  );
}
