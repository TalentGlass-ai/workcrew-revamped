"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useOnboardingStore } from "@/components/../lib/stores/onboardingStore";

export default function ReviewPage() {
  const router = useRouter();
  const { personalDetails, workExperience, education, professionalSummary, clearOnboardingState } = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalDetails, workExperience, professionalSummary }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to save profile. Please try again.");
        return;
      }
      clearOnboardingState();
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Review your details and submit</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Add a professional summary to showcase your strengths, career goals, and what makes you stand out to employers.
        </p>
      </section>

      <section className="p-6 md:p-10">
        <div className="max-w-4xl space-y-6">
          {/* Personal */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Personal information</h3>
              <button className="text-[#4D31EC]" onClick={() => router.push("/onboarding/personal-details")}>Edit</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Name:</span> {personalDetails.firstName} {personalDetails.lastName}</div>
              <div><span className="font-medium">Email:</span> {personalDetails.email}</div>
              <div><span className="font-medium">Phone:</span> {personalDetails.phoneCountry} {personalDetails.phone}</div>
              <div><span className="font-medium">Location:</span> {personalDetails.location}</div>
              <div className="md:col-span-2"><span className="font-medium">LinkedIn:</span> {personalDetails.linkedin || "—"}</div>
              <div className="md:col-span-2"><span className="font-medium">Portfolio:</span> {personalDetails.portfolio || "—"}</div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Work experience</h3>
              <button className="text-[#4D31EC]" onClick={() => router.push("/onboarding/work-experience")}>Edit</button>
            </div>
            {workExperience.title ? (
              <div className="text-sm space-y-2">
                <div className="font-medium">{workExperience.title} at {workExperience.company}</div>
                <div className="text-gray-600">
                  {workExperience.start} – {workExperience.current ? "Present" : workExperience.end}
                </div>
                <pre className="bg-[#F8F9FC] p-3 rounded-lg whitespace-pre-wrap">{workExperience.bullets}</pre>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No experience added.</div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Education</h3>
              <button className="text-[#4D31EC]" onClick={() => router.push("/onboarding/education")}>Edit</button>
            </div>
            {education.degree ? (
              <div className="text-sm space-y-1">
                <div className="font-medium">{education.degree} — {education.field}</div>
                <div>{education.institution}, {education.year}</div>
                {education.gpa && <div>CGPA: {education.gpa}</div>}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No education added.</div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Professional summary</h3>
              <button className="text-[#4D31EC]" onClick={() => router.push("/onboarding/professional-summary")}>Edit</button>
            </div>
            <p className="text-sm">{professionalSummary.summary || "—"}</p>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
            <button
              onClick={complete}
              disabled={saving}
              className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5] disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : "Complete profile ✓"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
