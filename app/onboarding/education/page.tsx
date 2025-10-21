"use client";

import { useRouter } from "next/navigation";
import React from "react";

function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try { return JSON.parse(localStorage.getItem("wc_onboard") || "{}"); } catch { return {} as T; }
}
function saveDraft(patch: Record<string, any>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft();
  localStorage.setItem("wc_onboard", JSON.stringify({ ...cur, ...patch }));
}

export default function EducationPage() {
  const router = useRouter();
  const draft = loadDraft();

  const [edu, setEdu] = React.useState({
    institution: draft.edu?.institution || "",
    degree: draft.edu?.degree || "",
    field: draft.edu?.field || "",
    year: draft.edu?.year || "",
    gpa: draft.edu?.gpa || "",
  });

  function next() {
    saveDraft({ edu });
    router.push("/onboarding/professional-summary");
  }
  function prev() {
    saveDraft({ edu });
    router.back();
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Add details of your education</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Showcasing your education helps employers understand your qualifications and makes your profile stand out.
        </p>
      </section>

      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Education</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Institution name *</label>
              <input
                value={edu.institution}
                onChange={(e) => setEdu({ ...edu, institution: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: National Institute of Technology"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Degree *</label>
              <input
                value={edu.degree}
                onChange={(e) => setEdu({ ...edu, degree: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: Bachelor of Science"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Field of study *</label>
              <input
                value={edu.field}
                onChange={(e) => setEdu({ ...edu, field: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: Computer science"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Graduation year *</label>
              <input
                value={edu.year}
                onChange={(e) => setEdu({ ...edu, year: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: 2020"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">GPA</label>
              <input
                value={edu.gpa}
                onChange={(e) => setEdu({ ...edu, gpa: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: 8.3"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prev} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
            <button onClick={next} className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">Next →</button>
          </div>
        </div>
      </section>
    </main>
  );
}
