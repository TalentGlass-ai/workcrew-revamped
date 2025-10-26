// PATH: workcrew-ui/components/landing/JobRoles.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import GlassPill from "../primitives/tags/GlassPill";
import LayeredPill, { ArrowNortheastIcon } from "../primitives/buttons/LayeredPill";
import T from "../primitives/Typography";

/* ---------- API type + helpers ---------- */
type Job = {
  _id?: string;
  id?: string | number;
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  salaryRange?: string;
  salary?: string;
  company?: { companyName?: string; name?: string; size?: string | number } | string | null;
  tags?: string[];
  skills?: string[];
  mustHaveSkills?: string[];
  goodToHaveSkills?: string[];
  category?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const companyName = (c: Job["company"]) =>
  (typeof c === "string" ? c : c?.companyName || c?.name) || "—";

/** Merge mustHaveSkills + skills + tags */
function normalizeSkills(j: Job): string[] {
  const raw = [
    ...(j.mustHaveSkills ?? []),
    ...(j.skills ?? []),
    ...(j.tags ?? []),
  ];
  return Array.from(new Set(raw.map((s) => (s || "").trim()).filter(Boolean)));
}

/** Category detection by title+skills (robust vs DB variance) */
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  tech: /\b(js|javascript|typescript|node|react|angular|vue|java|python|go|golang|c\+\+|c#|\.net|spring|django|flask|aws|gcp|azure|devops|kubernetes|docker|sql|nosql|microservices|backend|frontend|full[-\s]?stack|engineer|developer)\b/i,
  design: /\b(ui|ux|user\s?research|wireframe|figma|sketch|illustrator|photoshop|product\s*design|visual\s*design|interaction|designer)\b/i,
  product: /\b(product\s*(manager|management)|pm|roadmap|backlog|user\s*stories|jira|confluence)\b/i,
  marketing: /\b(marketing|seo|sem|content|copywriting|social|growth|performance\s*marketing|ppc|campaign|brand)\b/i,
  "customer-service": /\b(customer\s*(service|support|success)|helpdesk|ticket|crm)\b/i,
  sales: /\b(sales|bd|business\s*development|account\s*(exec|manager)|inside\s*sales|pre[-\s]?sales|pipeline)\b/i,
};

function matchesCategory(job: Job, cat: keyof typeof CATEGORY_PATTERNS) {
  const blob = `${job.title || ""} ${normalizeSkills(job).join(" ")}`;
  // Prefer explicit category string if present
  if (job.category && job.category.toLowerCase().includes(cat)) return true;
  return CATEGORY_PATTERNS[cat].test(blob);
}

/* ---------- Component ---------- */
export default function JobRoles() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Sidebar categories (now functional)
  const CATEGORIES = [
    { label: "Development", value: "tech" },
    { label: "Design", value: "design" },
    { label: "Product management", value: "product" },
    { label: "Marketing", value: "marketing" },
    { label: "Customer service", value: "customer-service" },
    { label: "Sales", value: "sales" },
  ] as const;

  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]["value"]>("tech");

  // scroller + expand UI
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [canExpand, setCanExpand] = useState<Record<string, boolean>>({});
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const [titleExpanded, setTitleExpanded] = useState<Record<string, boolean>>({});
  const [titleOverflows, setTitleOverflows] = useState<Record<string, boolean>>({});
  const titleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getId = (j: Job) => String(j._id ?? j.id ?? j.title ?? Math.random());

  /* Measure description overflow (for “Show more”) */
  const setDescRef =
    (id: string) =>
    (el: HTMLParagraphElement | null): void => {
      descRefs.current[id] = el;
      if (!el) return;
      requestAnimationFrame(() => {
        const original = el.className;
        el.className = original.replace(/\bline-clamp-\d+\b/g, "").trim();
        const full = el.scrollHeight;
        el.className = `${original} line-clamp-3`.trim();
        const clamped = el.clientHeight;
        const over = full > clamped + 1;
        setCanExpand((m) => (m[id] === over ? m : { ...m, [id]: over }));
      });
    };

  /* Fetch once (no category param — we filter client-side robustly) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${API}/api/v2/jobs?page=1&limit=24`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const list: Job[] =
          (Array.isArray(json)
            ? json
            : json.result ?? json.jobposts ?? json.jobs ?? json.data) || [];

        const normalized = list.map((j, i) => ({
          ...j, // keep every server field (mustHaveSkills, goodToHaveSkills, etc.)
          _id: j._id,
          id: j.id ?? j._id ?? `${j.title ?? "job"}-${i}`,
          title: j.title ?? "Untitled role",
          description: j.description ?? "",
          type: j.type ?? "",
          location: j.location ?? "",
          salaryRange: j.salaryRange ?? j.salary ?? "",
          salary: j.salary ?? "",
          company: j.company ?? null,
          tags: j.tags ?? [],
          skills: j.skills ?? undefined,
          mustHaveSkills: j.mustHaveSkills ?? undefined,
          goodToHaveSkills: j.goodToHaveSkills ?? undefined,
          category: j.category,
        }));

        if (!cancelled) setAllJobs(normalized);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "Failed to load jobs");
          setAllJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Apply the sidebar category filter (client-side) */
  useEffect(() => {
    // hide first 5 gibberish after filtering
    const cat = activeCategory;
    const subset = allJobs.filter((j) => matchesCategory(j, cat));
    setFiltered(subset.slice(5));
  }, [allJobs, activeCategory]);

  /* Carousel helpers */
  const SCROLL = 519 + 24;
  const scrollBy = (px: number) => trackRef.current?.scrollBy({ left: px, behavior: "smooth" });
  const toggleExpand = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const setTitleRef =
    (id: string) =>
    (el: HTMLDivElement | null) => {
      titleRefs.current[id] = el;
      if (!el) return;
      requestAnimationFrame(() => {
        const over = el.scrollWidth > el.clientWidth;
        setTitleOverflows((m) => (m[id] === over ? m : { ...m, [id]: over }));
      });
    };

  const toggleTitle = (id: string) =>
    setTitleExpanded((s) => ({ ...s, [id]: !s[id] }));

  /* ---------- UI ---------- */
  return (
    <section className="relative w-full overflow-x-hidden !my-0 !py-0">
      <div className="py-12 md:py-16">
        {/* header */}
        <header className="px-6 text-center">
          <GlassPill text="For candidates" iconColor="#2288FE" />
          <div className="mx-auto mt-4 w-[663px] max-w-full md:whitespace-nowrap">
            <T as="h2" variant="hero48" className="text-center text-black leading-[59px] font-540">
              <span className="text-[#4D31EC]">Discover</span> roles made for you!
            </T>
          </div>
          <T
            as="p"
            variant="sub20"
            className="mx-auto mt-3 max-w-none text-center text-black md:whitespace-nowrap leading-[27px]"
            trackingPct={3}
          >
            From startups to big companies, discover roles that match your skills and career aspirations
          </T>
        </header>

        {/* sidebar + horizontal scroller */}
        <div className="relative md:min-h-[365px] mt-[50px]">
          {/* sidebar */}
          <aside className="hidden md:block absolute left-[88px] top-0 h-[365px] w-[220px]">
            <ul className="space-y-6">
              {CATEGORIES.map(({ label, value }, idx) => {
                const active = activeCategory === value;
                return (
                  <li key={value} className="relative flex items-center gap-2 md:whitespace-nowrap">
                    {idx === 0 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={`h-[20px] w-[20px] ${active ? "text-[#4D31EC]" : "text-[#A2A2A2]"}`}
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                      </svg>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveCategory(value)}
                      className="text-left"
                    >
                      <T
                        as="span"
                        variant="body16"
                        className={[
                          "font-medium tracking-[0.03em]",
                          active
                            ? "text-[#4D31EC] relative before:absolute before:-bottom-2 before:left-0 before:h-[3px] before:w-28 before:bg-[#4D31EC]"
                            : "text-[#A2A2A2]",
                        ].join(" ")}
                      >
                        {label}
                      </T>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10">
              <LayeredPill href="/find-jobs" label="More jobs" icon={<ArrowNortheastIcon />} size="md" />
            </div>
          </aside>

          {/* cards column */}
          <div className="relative md:absolute md:left-[460px] md:top-0 md:right-0">
            <div className="relative px-6 md:pl-[40px] md:pr-0">
              {/* arrows (desktop) */}
              <button
                onClick={() => scrollBy(-SCROLL)}
                aria-label="Previous"
                className="absolute left-0 top-1/2 z-[2] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50 md:flex"
                title="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => scrollBy(SCROLL)}
                aria-label="Next"
                className="absolute right-2 top-1/2 z-[2] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50 md:flex"
                title="Next"
              >
                ›
              </button>

              {/* horizontal track */}
              <div
                ref={trackRef}
                className="
                  overflow-x-auto overflow-y-hidden px-2 pb-2
                  snap-x snap-mandatory touch-pan-x overscroll-x-contain
                  [scrollbar-width:none] [-ms-overflow-style:'none']
                  [&::-webkit-scrollbar]:hidden
                "
              >
                <div className="flex gap-6">
                  {/* skeletons */}
                  {loading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-none w-[519px] snap-start overflow-hidden rounded-2xl border border-[#E7EAFF] bg-white/70 p-6 animate-pulse"
                      >
                        <div className="h-6 w-40 rounded bg-slate-200" />
                        <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
                        <div className="mt-6 h-20 w-full rounded bg-slate-100" />
                        <div className="mt-6 h-12 w-full rounded bg-slate-200" />
                      </div>
                    ))}

                  {!loading && err && (
                    <T as="div" variant="body16" className="text-rose-600">
                      {err}
                    </T>
                  )}
                  {!loading && !err && filtered.length === 0 && (
                    <T as="div" variant="body16" className="text-slate-500">
                      No jobs found.
                    </T>
                  )}

                  {/* cards */}
                  {!loading &&
                    !err &&
                    filtered.map((job) => {
                      const id = getId(job);
                      const isOpen = !!expanded[id];
                      const skills = normalizeSkills(job);
                      const title = job.title || "Untitled role";
                      const showFullTitle = !!titleExpanded[id];
                      const clickEnabled = !!titleOverflows[id] || showFullTitle;

                      return (
                        <article
                          key={id}
                          className="flex flex-col flex-none w-[519px] snap-start overflow-hidden rounded-2xl border border-[#E7EAFF] bg-white p-6"
                        >
                          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-x-2">
                                {!showFullTitle ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleTitle(id)}
                                    disabled={!clickEnabled}
                                    className="block w-full text-left"
                                  >
                                    <div
                                      ref={setTitleRef(id)}
                                      className="w-full font-alt text-[20px] tracking-[0.03em] font-medium text-black leading-[23px] whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                      {title}
                                    </div>
                                  </button>
                                ) : (
                                  <div className="w-full">
                                    <span className="font-alt text-[20px] font-medium text-black leading-[23px]">
                                      {title}
                                    </span>{" "}
                                    <button
                                      type="button"
                                      onClick={() => toggleTitle(id)}
                                      className="text-[#4D31EC] hover:underline inline"
                                    >
                                      <T as="span" variant="sub14">Show less</T>
                                    </button>
                                  </div>
                                )}
                              </div>

                              <T
                                as="div"
                                variant="sub20"
                                className="mt-1 break-words text-[#4D31EC] leading-[23px] font-medium"
                              >
                                {companyName(job.company)}
                              </T>
                            </div>

                            {job.type && (
                              <span className="inline-flex h-[32px] items-center rounded-full bg-[#EEF0FF] px-3">
                                <T as="span" variant="sub14" className="text-[#4D31EC]" weight={600}>
                                  {job.type}
                                </T>
                              </span>
                            )}
                          </div>

                          {/* skills row (under meta) */}
                          {skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {skills.slice(0, 6).map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-gray-200 bg-[#F8F8FE] px-3 py-1 text-[12px] text-gray-800"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex flex-col flex-1">
                            <p
                              id={`desc-${id}`}
                              ref={setDescRef(id)}
                              className={[
                                "font-alt text-[16px] tracking-[0.03em] text-black leading-[23px]",
                                isOpen ? "" : "line-clamp-3",
                              ].join(" ")}
                            >
                              {job.description ?? "—"}
                            </p>

                            {canExpand[id] && (
                              <button
                                type="button"
                                onClick={() => setExpanded((s) => ({ ...s, [id]: !s[id] }))}
                                className="mt-1 text-[#4D31EC] hover:underline"
                              >
                                <T as="span" variant="sub14">
                                  {isOpen ? "Show less" : "Show more"}
                                </T>
                              </button>
                            )}
                          </div>

                          <div className="mt-4 flex items-center gap-6 text-slate-600">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-slate-600" fill="currentColor">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <T as="span" variant="body16">{job.location}</T>
                              </span>
                            )}
                            {(job.salaryRange || job.salary) && (
                              <T as="span" variant="body16">
                                ₹ {job.salaryRange ?? job.salary}
                              </T>
                            )}
                          </div>

                          <a
                            href="/login?role=candidate"
                            className="mt-[20px] block w-full rounded-xl bg-[#4D31EC] py-3 text-center hover:brightness-110"
                          >
                            <T as="span" variant="body16" className="text-white">
                              Apply Now
                            </T>
                          </a>
                        </article>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{/* /internal padding */}
    </section>
  );
}
