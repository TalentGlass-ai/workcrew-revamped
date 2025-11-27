"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { CandidateAPI } from "workcrew-ui/lib/endpoints";
import T from "workcrew-ui/components/primitives/Typography";

/* ---------------- localStorage helpers ---------------- */

function loadDraft<T = any>(): T {
  try {
    if (typeof window === "undefined") return {} as T;
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

function clearDraft() {
  if (typeof window !== "undefined") localStorage.removeItem("wc_onboard");
}

/* ------------- very light fallback skill extraction ------------- */
/* Only used if the resume parser didn't return a skills array. */
function deriveSkillsFromText(text: string, max = 6): string[] {
  if (!text) return [];
  const chunks = text
    .split(/[\n•,\-–]/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && c.length <= 40);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const chunk of chunks) {
    const key = chunk.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(chunk);
      if (result.length >= max) break;
    }
  }
  return result;
}

/* small chip so skills look like the figma tags */
function SkillChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full bg-[#EEEAFE] px-4 py-1.5 text-xs font-medium text-[#4D31EC] hover:bg-[#E0D9FF]"
    >
      <T as="span" variant="sub14" lineHeightPx={20}>
        {label}
      </T>
      <span className="text-[10px] text-[#4D31EC]">✕</span>
    </button>
  );
}

export default function ReviewPage() {
  const router = useRouter();

  const [data, setData] = React.useState<any>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [workSkills, setWorkSkills] = React.useState<string[]>([]);
  const [eduSkills, setEduSkills] = React.useState<string[]>([]);

  // pull everything once on mount & seed the skill chips
  React.useEffect(() => {
    const draft = loadDraft<any>();
    setData(draft);

    const skillsFromResume: string[] =
      draft.skillsFromResume ||
      draft.skills ||
      draft.rawParserOutput?.skills ||
      [];

    // if user already curated skills earlier, respect that
    let initialWork: string[] = [];
    let initialEdu: string[] = [];

    if (Array.isArray(draft.workSkills) && draft.workSkills.length) {
      initialWork = draft.workSkills;
    } else if (skillsFromResume.length) {
      // first few skills under work experience
      initialWork = skillsFromResume.slice(0, 6);
    } else {
      // fallback: derive from bullets / summary
      initialWork = deriveSkillsFromText(
        draft.exp?.bullets || draft.summary || "",
        6
      );
    }

    if (Array.isArray(draft.eduSkills) && draft.eduSkills.length) {
      initialEdu = draft.eduSkills;
    } else if (skillsFromResume.length > 6) {
      // next few under education, just to spread them a bit
      initialEdu = skillsFromResume.slice(6, 12);
    } else {
      initialEdu = deriveSkillsFromText(
        [draft.edu?.degree, draft.edu?.field, draft.edu?.institution].join(
          " "
        ),
        4
      );
    }

    setWorkSkills(initialWork);
    setEduSkills(initialEdu);
  }, []);

  // keep latest chip state in localStorage so we can reuse elsewhere if needed
  React.useEffect(() => {
    saveDraft({ workSkills, eduSkills });
  }, [workSkills, eduSkills]);

  const fullName = data.firstName
    ? [data.firstName, data.lastName].filter(Boolean).join(" ")
    : "";
  const phoneDisplay =
    [data.phoneCountry || "+91", data.phone].filter(Boolean).join(" ") || "";

  // Calls backend /candidate/complete/:id to persist resume/profile data
  async function complete() {
    try {
      setErrorMsg(null);
      setSubmitting(true);

      const draft = loadDraft<any>();

      // 1) Get logged-in candidate info to know their ID
      const profileRes = await CandidateAPI.profile();
      const candidate = profileRes.data?.result ?? profileRes.data ?? null;
      const candidateId = candidate?._id;

      if (!candidateId) {
        throw new Error("Could not determine candidate id from profile.");
      }

      // 2) Build payload in the shape backend expects.
      //    We already stored the raw parser output on upload as rawParserOutput.
      const rawForBackend: any = draft.rawParserOutput || {};

      // Merge curated skills back into what goes to Flask/Node.
      const combinedSkills = Array.from(
        new Set<string>([
          ...(rawForBackend.skills || []),
          ...workSkills,
          ...eduSkills,
        ])
      ).filter(Boolean);

      rawForBackend.skills = combinedSkills;

      const payload = {
        data: {
          result: rawForBackend,
        },
      };

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

  /* ------------------------------ UI ------------------------------ */

  // clean bullets for the work experience preview
  const workBulletLines: string[] = (data.exp?.bullets || "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen flex bg-white">
      {/* left rail: static explanation for this step */}
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
              <T as="h1" variant="title24" className="mt-6">
                Review your details and submit
              </T>
              <T
                as="p"
                variant="body14"
                lineHeightPx={20}
                className="mt-3 max-w-md text-gray-600"
              >
                Take a quick look at everything you have filled in so far and
                make sure it reflects you the way you want.
              </T>
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

      {/* right side: review cards + final CTA */}
      <section className="flex w-full items-start justify-center bg-white px-6 py-10 md:w-1/2 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          <T
            as="h2"
            variant="hero48"
            autoLeading
            className="mb-6 text-[#4D31EC] md:mb-8"
          >
            Review data
          </T>

          <div className="space-y-6">
            {/* ---------------- PERSONAL INFO CARD ---------------- */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <T as="h3" variant="sub20">
                  Personal information
                </T>
                <button
                  className="text-sm font-medium text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/personal-details")}
                >
                  Edit
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* left column */}
                <div className="space-y-2">
                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      Name
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-900"
                    >
                      {fullName || "—"}
                    </T>
                  </div>

                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      Phone
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-900"
                    >
                      {phoneDisplay || "—"}
                    </T>
                  </div>

                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      LinkedIn
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-[#4D31EC]"
                    >
                      {data.linkedin || "—"}
                    </T>
                  </div>
                </div>

                {/* right column */}
                <div className="space-y-2">
                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      Email
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-900"
                    >
                      {data.email || "—"}
                    </T>
                  </div>

                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      Location
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-900"
                    >
                      {data.location || "—"}
                    </T>
                  </div>

                  <div>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-400"
                    >
                      Portfolio
                    </T>
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-[#4D31EC]"
                    >
                      {data.portfolio || "—"}
                    </T>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- WORK EXPERIENCE CARD ---------------- */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <T as="h3" variant="sub20">
                  Work experience
                </T>
                <button
                  className="text-sm font-medium text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/work-experience")}
                >
                  Edit
                </button>
              </div>

              {data.exp ? (
                <div className="space-y-2">
                  <T
                    as="p"
                    variant="body14"
                    lineHeightPx={20}
                    className="font-semibold text-gray-900"
                  >
                    {data.exp.title || "Title"}{" "}
                    {data.exp.company ? `at ${data.exp.company}` : ""}
                  </T>

                  <T
                    as="p"
                    variant="body14"
                    lineHeightPx={20}
                    className="text-gray-500"
                  >
                    {data.exp.start
                      ? `${data.exp.start} – ${
                          data.exp.current ? "Present" : data.exp.end || ""
                        }`
                      : "Dates not provided"}
                  </T>

                  {/* responsibilities list */}
                  {workBulletLines.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {workBulletLines.map((line: string, idx: number) => (
                        <li key={idx}>
                          <T
                            as="span"
                            variant="body14"
                            lineHeightPx={20}
                            className="text-gray-800"
                          >
                            {line.replace(/^•\s*/, "")}
                          </T>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* skills chips pulled from parser or text */}
                  {workSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {workSkills.map((s) => (
                        <SkillChip
                          key={s}
                          label={s}
                          onRemove={() =>
                            setWorkSkills((prev) => prev.filter((x) => x !== s))
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <T
                  as="p"
                  variant="body14"
                  lineHeightPx={20}
                  className="text-gray-500"
                >
                  No experience added.
                </T>
              )}
            </div>

            {/* ---------------- EDUCATION CARD ---------------- */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <T as="h3" variant="sub20">
                  Education
                </T>
                <button
                  className="text-sm font-medium text-[#4D31EC] hover:underline"
                  onClick={() => router.push("/onboarding/education")}
                >
                  Edit
                </button>
              </div>

              {data.edu ? (
                <div className="space-y-2">
                  <T
                    as="p"
                    variant="body14"
                    lineHeightPx={20}
                    className="font-semibold text-gray-900"
                  >
                    {data.edu.degree || "Degree"}{" "}
                    {data.edu.field ? `in ${data.edu.field}` : ""}
                  </T>

                  <T
                    as="p"
                    variant="body14"
                    lineHeightPx={20}
                    className="text-gray-700"
                  >
                    {data.edu.institution || "Institution not provided"}
                    {data.edu.year ? `, ${data.edu.year}` : ""}
                  </T>

                  {data.edu.gpa && (
                    <T
                      as="p"
                      variant="body14"
                      lineHeightPx={20}
                      className="text-gray-500"
                    >
                      CGPA: {data.edu.gpa}
                    </T>
                  )}

                  {eduSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {eduSkills.map((s) => (
                        <SkillChip
                          key={s}
                          label={s}
                          onRemove={() =>
                            setEduSkills((prev) => prev.filter((x) => x !== s))
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <T
                  as="p"
                  variant="body14"
                  lineHeightPx={20}
                  className="text-gray-500"
                >
                  No education added.
                </T>
              )}
            </div>

            {/* ---------------- SUMMARY CARD ---------------- */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <T as="h3" variant="sub20">
                  Professional summary
                </T>
                <button
                  className="text-sm font-medium text-[#4D31EC] hover:underline"
                  onClick={() =>
                    router.push("/onboarding/professional-summary")
                  }
                >
                  Edit
                </button>
              </div>
              <T
                as="p"
                variant="body14"
                lineHeightPx={20}
                className="text-gray-800"
              >
                {data.summary || "You haven’t added a professional summary yet."}
              </T>
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
                className="rounded-full border px-6 py-3 text-sm hover:border-[#4D31EC]"
                disabled={submitting}
              >
                ← Previous
              </button>
              <button
                onClick={complete}
                className="rounded-full bg-[#4D31EC] px-8 py-3 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-50"
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
