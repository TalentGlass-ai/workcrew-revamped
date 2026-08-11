"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Stepper, { Step } from "../Stepper";

const STEPS: Step[] = [
  { key: "personal", label: "Personal details" },
  { key: "work",     label: "Work experience" },
  { key: "summary",  label: "Professional summary" },
  { key: "education",label: "Education" },
  { key: "skills",   label: "Skills" },
];

const QUICK_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "Django", "FastAPI", "Spring Boot",
  "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "Git", "GraphQL", "REST APIs", "Machine Learning", "SQL",
  "Figma", "Product Management", "Agile", "Scrum",
];

export default function SkillsOnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(skill: string) {
    setSelected(s => {
      const next = new Set(s);
      if (next.has(skill)) next.delete(skill); else next.add(skill);
      return next;
    });
  }

  function addCustom() {
    const s = custom.trim();
    if (!s) return;
    setSelected(prev => new Set([...prev, s]));
    setCustom("");
  }

  async function handleNext() {
    setSaving(true);
    if (selected.size > 0) {
      await Promise.all(
        [...selected].map(name =>
          fetch("/api/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, source: "self_reported" }),
          }).catch(() => null)
        )
      );
    }
    setSaving(false);
    router.push("/onboarding/review");
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        <div className="mt-10 flex flex-col items-center justify-center space-y-6 md:items-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#4D31EC]/10 text-5xl">⚡</div>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">Add your skills</h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-gray-600">
              Skills power your job recommendations. Pick the ones you know — you can always add more later.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => router.push("/onboarding/review")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600">
          Skip for now
        </button>
      </section>

      <section className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <Stepper steps={STEPS} active={4} />
          </div>

          <h2 className="mb-6 text-center text-2xl font-semibold text-[#4D31EC]">Pick your skills</h2>

          {/* Quick-add chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {QUICK_SKILLS.map(s => (
              <button key={s} type="button" onClick={() => toggle(s)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected.has(s)
                    ? "bg-[#4D31EC] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-[#4D31EC]/10 hover:text-[#4D31EC]"
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Custom skill input */}
          <div className="flex gap-2 mb-6">
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
              placeholder="Add a custom skill…"
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/20 transition-all"
            />
            <button type="button" onClick={addCustom}
              className="rounded-lg border border-[#4D31EC] px-4 py-2.5 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/5 transition-colors">
              Add
            </button>
          </div>

          {selected.size > 0 && (
            <p className="mb-6 text-sm text-gray-500">{selected.size} skill{selected.size !== 1 ? "s" : ""} selected</p>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => router.back()}
              className="rounded-full border px-6 py-3 hover:border-[#4D31EC] transition-colors">
              ← Previous
            </button>
            <button type="button" onClick={handleNext} disabled={saving}
              className="rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : "Next →"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
