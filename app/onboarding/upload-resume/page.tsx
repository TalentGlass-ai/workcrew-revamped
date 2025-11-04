"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
// shared axios instance, adjust import if your path is different
import api from "workcrew-ui/lib/api";

// helpers to keep a draft in localStorage across steps
function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try {
    return JSON.parse(localStorage.getItem("wc_onboard") || "{}");
  } catch {
    return {} as T;
  }
}

function saveDraft(patch: Record<string, any>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft();
  localStorage.setItem("wc_onboard", JSON.stringify({ ...cur, ...patch }));
}

// this turns whatever the parser sends into a shape our onboarding pages can use
type RawParserOut = any;

function toArray<T = any>(v: any): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

function normalizeParserOutput(raw: RawParserOut) {
  const base = raw?.result ?? raw?.data ?? raw ?? {};

  const name =
    base.name?.full ||
    [base.firstName, base.lastName].filter(Boolean).join(" ") ||
    base.fullName ||
    base.name ||
    "";

  const email =
    base.email ||
    base.emails?.[0] ||
    base.contacts?.email ||
    base.contact?.email ||
    "";

  const phone =
    base.phone ||
    base.phones?.[0] ||
    base.contacts?.phone ||
    base.contact?.phone ||
    "";

  const headline =
    base.headline ||
    base.title ||
    base.currentTitle ||
    "";

  const summary =
    base.summary ||
    base.professionalSummary ||
    base.about ||
    "";

  const location =
    base.location?.formatted ||
    [base.location?.city, base.location?.state, base.location?.country]
      .filter(Boolean)
      .join(", ") ||
    base.address ||
    "";

  const skillsRaw =
    base.skills ||
    base.skillList ||
    base.skillSet ||
    [];
  const skills = toArray(skillsRaw)
    .map((s: any) =>
      typeof s === "string" ? s : (s?.name || s?.skill || "").toString()
    )
    .filter(Boolean);

  const educationRaw =
    base.education ||
    base.educations ||
    base.educationHistory ||
    [];
  const education = toArray(educationRaw).map((e: any) => ({
    institute: e?.institution || e?.school || e?.college || "",
    degree: e?.degree || e?.qualification || "",
    field: e?.field || e?.area || "",
    startDate: e?.startDate || e?.from || "",
    endDate: e?.endDate || e?.to || "",
    grade: e?.grade || e?.cgpa || "",
  }));

  const expRaw =
    base.experience ||
    base.experiences ||
    base.work ||
    base.workHistory ||
    [];
  const experience = toArray(expRaw).map((w: any) => ({
    company: w?.company || w?.employer || "",
    title: w?.title || w?.position || "",
    startDate: w?.startDate || w?.from || "",
    endDate: w?.endDate || w?.to || "",
    location: w?.location || "",
    summary:
      toArray(w?.highlights || w?.summary || [])
        .join(" ")
        .trim() || "",
  }));

  const links = {
    linkedin:
      base.links?.linkedin ||
      base.linkedin ||
      base.profiles?.linkedin ||
      "",
    github:
      base.links?.github ||
      base.github ||
      base.profiles?.github ||
      "",
    portfolio:
      base.links?.portfolio ||
      base.website ||
      base.url ||
      "",
    twitter:
      base.links?.twitter ||
      base.twitter ||
      "",
  };

  let firstName = "";
  let lastName = "";
  if (name) {
    const parts = name.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  return {
    name,
    firstName,
    lastName,
    email,
    phone,
    location,
    headline,
    summary,
    skills,
    education,
    experience,
    links,
    autoFilledFromResume: true,
    rawParserOutput: base,
  };
}

export default function UploadResumePage() {
  const router = useRouter();

  const [fileName, setFileName] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // point this to the backend route that actually parses the resume
  const PARSE_ROUTE = "/candidate/parse-resume";

  // sends the file to the backend and then seeds the onboarding draft
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setErrorMsg(null);
    setFileName(f.name);
    saveDraft({ resumeName: f.name });
    setUploading(true);

    try {
      const fd = new FormData();
      // make sure "resume" matches what your backend expects
      fd.append("resume", f);

      const res = await api.post(PARSE_ROUTE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = res?.data ?? {};
      const normalized = normalizeParserOutput(payload);

      saveDraft(normalized);
      router.push("/onboarding/personal-details");
    } catch (err: any) {
      console.error("resume parse error", err);
      setErrorMsg(
        "We couldn't parse that resume automatically. You can still continue and fill details manually."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleContinueClick() {
    router.push("/onboarding/personal-details");
  }

  function handleCreateClick() {
    saveDraft({ wantsBuilder: true });
    router.push("/onboarding/personal-details");
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* left side stays fixed on desktop and explains the first step */}
      <section className="relative hidden w-1/2 bg-[#F6F5FF] md:block">
        <div className="sticky top-0 h-screen px-10 py-16 md:px-20">
          <Image
            src="/logo.png"
            alt="WorkCrew.ai"
            width={116}
            height={21}
            className="absolute left-[50px] top-[50px]"
            priority
          />

          <div className="mt-10 flex h-full flex-col items-center justify-center space-y-6 md:items-start">
            <Image
              src="/pana.png"
              alt="Upload resume illustration"
              width={260}
              height={260}
              className="mb-2 object-contain"
              priority
            />

            <div className="text-center md:text-left">
              <h1 className="text-xl font-semibold text-black md:text-2xl">
                Upload or create your resume
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600 md:text-base">
                Uploading or creating a resume is required to continue. This
                helps employers review your qualifications effectively.
              </p>
            </div>
          </div>

          <button
            disabled={uploading}
            onClick={handleContinueClick}
            className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            Skip for now
          </button>
        </div>
      </section>

      {/* right side scrolls and holds upload and builder options */}
      <section className="flex w-full items-center justify-center bg-white px-8 py-16 md:w-1/2 md:px-24">
        <div className="mx-auto w-full max-w-xl text-center">
          <h2 className="text-4xl font-semibold text-[#4D31EC]">
            Let’s get started!
          </h2>
          <p className="mt-2 text-gray-500">
            Upload your resume or create one to get matched to jobs.
          </p>

          <div className="mt-10 space-y-6">
            {/* upload resume box */}
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#C8C6FF] bg-[#F9F8FF] p-8 transition hover:border-[#4D31EC]">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
              <div className="flex flex-col items-center justify-center text-[#4D31EC]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                  />
                </svg>

                <span className="font-medium">
                  {uploading ? "Uploading & parsing..." : "Upload resume"}
                </span>

                {fileName && (
                  <span className="mt-1 text-sm text-gray-500">
                    {fileName}
                  </span>
                )}

                {errorMsg && (
                  <span className="mt-2 max-w-[260px] text-xs text-red-500">
                    {errorMsg}
                  </span>
                )}
              </div>
            </label>

            {/* create resume box */}
            <button
              className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] p-8 transition hover:border-[#4D31EC] disabled:opacity-40"
              onClick={handleCreateClick}
              disabled={uploading}
            >
              <div className="flex flex-col items-center justify-center text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">Create resume</span>
              </div>
            </button>

            {/* continue without upload (manual fill) */}
            <div className="pt-2">
              <button
                onClick={handleContinueClick}
                className="w-full rounded-full bg-[#4D31EC] py-3 font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-40"
                disabled={uploading}
              >
                {uploading ? "Please wait..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
