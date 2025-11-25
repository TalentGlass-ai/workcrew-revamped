"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { CandidateAPI } from "workcrew-ui/lib/endpoints";

// quick helpers for the onboarding draft
function loadDraft<T = any>(): T {
  try {
    if (typeof window === "undefined") return {} as T;
    return JSON.parse(localStorage.getItem("wc_onboard") || "{}");
  } catch {
    return {} as T;
  }
}

function clearDraft() {
  if (typeof window !== "undefined") localStorage.removeItem("wc_onboard");
}

export default function ReviewPage() {
  const router = useRouter();

  // we pull the data from localStorage once the page mounts
  const [data, setData] = React.useState<any>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setData(loadDraft());
  }, []);

  // Calls backend /candidate/complete/:id to persist resume/profile data
  async function complete() {
    try {
      setErrorMsg(null);
      setSubmitting(true);

      const draft = loadDraft<any>();

      // 1) Get logged-in candidate info to know their ID
      const profileRes = await CandidateAPI.profile();
      const candidate =
        profileRes.data?.result ?? profileRes.data ?? null;
      const candidateId = candidate?._id;

      if (!candidateId) {
        throw new Error("Could not determine candidate id from profile.");
      }

      // 2) Build payload in the shape backend expects:
      //    patchCandidateByResume reads: const { data } = req.body;
      //    and then: const { about, contact, skills, links, education, workExperience, projects } = data.result;
      //
      // We already stored the raw parser output as rawParserOutput in wc_onboard
      // when parsing the resume on the upload step.
      const rawForBackend = draft.rawParserOutput || {};

      const payload = {
        data: {
          result: rawForBackend,
        },
      };

      // Optional: log to verify once
      console.log("Completing resume with payload:", payload);

      // 3) Call backend to complete candidate profile from resume data
      await CandidateAPI.completeFromResume(candidateId, payload);

      // 4) Clear local draft & redirect to find jobs
      clearDraft();
      router.push("/find-jobs");
    } catch (err: any) {
      console.error("Error completing resume:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Something went wrong while saving your resume. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* left side stays fixed on desktop and explains what this step is */}
      <section className="relative hidden w-1/2 bg-[#F6F5FF] md:block">
        <div className="sticky top-0 h-screen px-10 py-16 md:px-20">
          <div className="relative h-full">
            <Image
              src="/logo.png"
              alt="WorkCrew.ai"
              width={116}
              height={21}
              className="absolute left-[50px] top-[50px]"
              priority
            />

            <div className="absolute top-1/2 left-[50px] right-[50px] -translate-y-1/2 flex w-[min(440px,calc(100%-100px))] flex-col items-start text-left">
              <Image
                src="/reviewdata.png"
                alt="Review data illustration"
                width={220}
                height={176}
                className="object-contain"
                priority
              />
              <h1 className="mt-6 text-xl font-semibold text-black md:text-2xl">
                Review your details and submit
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
                Take a quick look at everything you have filled in so far and
                make sure it reflects you the way you want.
              </p>
            </div>

            <button
              onClick={() => router.push("/find-jobs")}
              className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
            >
              Skip for now
            </button>
          </div>
        </div>
      </section>

      {/* right side scrolls and shows the review cards */}
      <section className="flex w-full items-start justify-center bg-white px-6 py-10 md:w-1/2 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          <h2 className="mb-6 text-2xl font-semibold text-[#4D31EC] md:mb-8">
            Review data
          </h2>

          <div className="space-y-6">
            {/* personal info card */}
            <div className="rounded-xl border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personal information</h3>
                <button
                  className="text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/personal-details")}
                >
                  Edit
                </button>
              </div>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {data.firstName
                    ? `${data.firstName} ${data.lastName ?? ""}`
                    : "—"}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {data.email || "—"}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {[data.phoneCountry, data.phone]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {data.location || "—"}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">LinkedIn:</span>{" "}
                  {data.linkedin || "—"}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Portfolio:</span>{" "}
                  {data.portfolio || "—"}
                </div>
              </div>
            </div>

            {/* work experience card */}
            <div className="rounded-xl border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work experience</h3>
                <button
                  className="text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/work-experience")}
                >
                  Edit
                </button>
              </div>

              {data.exp ? (
                <div className="space-y-2 text-sm">
                  <div className="font-medium">
                    {data.exp.title} at {data.exp.company}
                  </div>
                  <div className="text-gray-600">
                    {data.exp.start} –{" "}
                    {data.exp.current ? "Present" : data.exp.end}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-[#F8F9FC] p-3">
                    {data.exp.bullets}
                  </pre>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F4F3FF] px-3 py-1 text-xs text-[#4D31EC]">
                      Leadership
                    </span>
                    <span className="rounded-full bg-[#F4F3FF] px-3 py-1 text-xs text-[#4D31EC]">
                      Python
                    </span>
                    <span className="rounded-full bg-[#F4F3FF] px-3 py-1 text-xs text-[#4D31EC]">
                      SQL
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No experience added.
                </div>
              )}
            </div>

            {/* education card */}
            <div className="rounded-xl border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
                <button
                  className="text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/education")}
                >
                  Edit
                </button>
              </div>

              {data.edu ? (
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    {data.edu.degree} — {data.edu.field}
                  </div>
                  <div>
                    {data.edu.institution}, {data.edu.year}
                  </div>
                  {data.edu.gpa && <div>CGPA: {data.edu.gpa}</div>}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No education added.
                </div>
              )}
            </div>

            {/* summary card */}
            <div className="rounded-xl border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Professional summary</h3>
                <button
                  className="text-[#4D31EC] hover:underline"
                  onClick={() =>
                    router.push("/onboarding/professional-summary")
                  }
                >
                  Edit
                </button>
              </div>
              <p className="text-sm">{data.summary || "—"}</p>
            </div>

            {/* error message, if any */}
            {errorMsg && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* final actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="rounded-full border px-6 py-3 hover:border-[#4D31EC]"
                disabled={submitting}
              >
                ← Previous
              </button>
              <button
                onClick={complete}
                className="rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Complete resume ✓"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
