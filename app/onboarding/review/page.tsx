"use client";

import { useRouter } from "next/navigation";
import React from "react";

function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try { return JSON.parse(localStorage.getItem("wc_onboard") || "{}"); } catch { return {} as T; }
}
function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wc_onboard");
}

export default function ReviewPage() {
  const router = useRouter();
  const data = loadDraft();

  function complete() {
    // Submit to API here if needed
    clearDraft();
    router.push("/find-jobs"); // or dashboard
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
              <div><span className="font-medium">Name:</span> {data.firstName} {data.lastName}</div>
              <div><span className="font-medium">Email:</span> {data.email}</div>
              <div><span className="font-medium">Phone:</span> {data.phoneCountry} {data.phone}</div>
              <div><span className="font-medium">Location:</span> {data.location}</div>
              <div className="md:col-span-2"><span className="font-medium">LinkedIn:</span> {data.linkedin || "—"}</div>
              <div className="md:col-span-2"><span className="font-medium">Portfolio:</span> {data.portfolio || "—"}</div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Work experience</h3>
              <button className="text-[#4D31EC]" onClick={() => router.push("/onboarding/work-experience")}>Edit</button>
            </div>
            {data.exp ? (
              <div className="text-sm space-y-2">
                <div className="font-medium">{data.exp.title} at {data.exp.company}</div>
                <div className="text-gray-600">
                  {data.exp.start} – {data.exp.current ? "Present" : data.exp.end}
                </div>
                <pre className="bg-[#F8F9FC] p-3 rounded-lg whitespace-pre-wrap">{data.exp.bullets}</pre>
                <div className="flex gap-2 flex-wrap mt-2">
                  <span className="px-3 py-1 rounded-full bg-[#F4F3FF] text-[#4D31EC] text-xs">Leadership</span>
                  <span className="px-3 py-1 rounded-full bg-[#F4F3FF] text-[#4D31EC] text-xs">Python</span>
                  <span className="px-3 py-1 rounded-full bg-[#F4F3FF] text-[#4D31EC] text-xs">SQL</span>
                </div>
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
            {data.edu ? (
              <div className="text-sm space-y-1">
                <div className="font-medium">{data.edu.degree} — {data.edu.field}</div>
                <div>{data.edu.institution}, {data.edu.year}</div>
                {data.edu.gpa && <div>CGPA: {data.edu.gpa}</div>}
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
            <p className="text-sm">{data.summary || "—"}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
            <button onClick={complete} className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">
              Complete resume ✓
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
