"use client";

import { useEffect, useRef, useState } from "react";
import GlassPill from "../primitives/tags/GlassPill";
import LayeredPill, { ArrowNortheastIcon } from "../primitives/buttons/LayeredPill";

type Job = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  salaryRange?: string;
  company?: { companyName?: string; name?: string } | string | null;
  tags?: string[];
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const companyName = (c: Job["company"]) =>
  (typeof c === "string" ? c : c?.companyName || c?.name) || "—";

export default function JobRoles() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [canExpand, setCanExpand] = useState<Record<string, boolean>>({});
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const getId = (j: Job) => String(j._id || j.id || j.title || Math.random());

  // measure description overflow and decide if "Show more" is needed
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
        const overflows = full > clamped + 1;
        setCanExpand((m) => (m[id] === overflows ? m : { ...m, [id]: overflows }));
        el.className = `${original} line-clamp-3`.trim();
      });
    };

  // fetch jobs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/v2/jobs?page=1&limit=12`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: Job[] = json?.jobposts || json?.result || [];
        if (!cancelled) setJobs(list);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // horizontal scroll helpers
  const SCROLL = 519 + 24;
  const scrollBy = (px: number) => trackRef.current?.scrollBy({ left: px, behavior: "smooth" });

  const toggleExpand = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // drop the first 5 items (remove gibberish cards)
  const cleanedJobs = jobs.slice(5);

  return (
    <section className="relative w-full overflow-x-hidden px-0 pb-10 pt-16">
      {/* Header */}
      <header className="px-6 text-center">
        <GlassPill text="For candidates" iconColor="#2288FE" />

        <div className="mx-auto mt-4 w-[663px] max-w-full whitespace-nowrap">
          <h2 className="text-center font-[540] text-[48px] leading-[59px] tracking-[0.01em]">
            <span className="text-[#4D31EC]">Discover</span>{" "}
            <span className="text-black">roles made for you!</span>
          </h2>
        </div>

        <p className="mx-auto mt-3 max-w-none whitespace-nowrap text-center text-[20px] leading-[27px] tracking-[0.03em] text-black">
          From startups to big companies, discover roles that match your skills and career aspirations
        </p>
      </header>

      {/* Layout: sidebar + cards */}
      <div className="relative md:min-h-[365px]">
        {/* Sidebar */}
        <aside className="absolute left-[88px] top-0 hidden h-[365px] w-[164px] md:block">
          <ul className="space-y-6">
            <li className="relative flex items-center gap-2 whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-[36px] w-[20.2px] text-[#4D31EC]"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              <span
                className={`
                  font-alt font-medium text-[16px] tracking-[0.03em] text-[#4D31EC]
                  before:absolute before:-bottom-2 before:left-0 before:h-[3px] before:w-28 before:bg-[#4D31EC]
                `}
              >
                Development
              </span>
            </li>
            <li className="whitespace-nowrap font-alt font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2]">
              Design
            </li>
            <li className="whitespace-nowrap font-alt font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2]">
              Product management
            </li>
            <li className="whitespace-nowrap font-alt font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2]">
              Marketing
            </li>
            <li className="whitespace-nowrap font-alt font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2]">
              Customer service
            </li>
            <li className="whitespace-nowrap font-alt font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2]">
              Sales
            </li>
          </ul>
          <div className="mt-10">
            <LayeredPill href="/jobs" label="More jobs" icon={<ArrowNortheastIcon />} size="md" />
          </div>
        </aside>

        {/* Cards wrapper */}
        <div className="absolute left-[460px] top-0 right-0">
          <div className="relative overflow-hidden px-6 md:pl-[40px] md:pr-0">
            {/* right fade mask */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />

            {/* arrows */}
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
              className="[-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto overflow-y-hidden px-2 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-6">
                {/* loading skeletons */}
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

                {!loading && err && <div className="text-rose-600">{err}</div>}
                {!loading && !err && cleanedJobs.length === 0 && (
                  <div className="text-slate-500">No jobs found.</div>
                )}

                {/* job cards */}
                {!loading &&
                  !err &&
                  cleanedJobs.map((job) => {
                    const id = getId(job);
                    const isOpen = !!expanded[id];
                    const isExpandable = !!canExpand[id];

                    return (
                      <article
                        key={id}
                        className="flex flex-col flex-none w-[519px] snap-start overflow-hidden rounded-2xl border border-[#E7EAFF] bg-white p-6"
                      >
                        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                          <div className="min-w-0">
                            <div className="break-words text-[20px] font-medium leading-[23px] tracking-[0.03em] text-black">
                              {job.title || "Untitled role"}
                            </div>
                            <div className="mt-1 break-words text-[20px] font-medium leading-[23px] tracking-[0.03em] text-[#4D31EC]">
                              {companyName(job.company)}
                            </div>
                          </div>

                          {job.type && (
                            <span className="inline-flex h-[32px] items-center self-start justify-self-end rounded-full bg-[#EEF0FF] px-3">
                              <span className="font-alt text-[16px] font-semibold leading-[23px] tracking-[0.03em] text-[#4D31EC]">
                                {job.type}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* body */}
                        <div className="mt-4 flex flex-col">
                          <div>
                            <p
                              id={`desc-${id}`}
                              ref={setDescRef(id)}
                              className={[
                                "font-alt text-[16px] leading-[23px] tracking-[0.03em] text-slate-700 min-h-[46px]",
                                isOpen ? "line-clamp-none" : "line-clamp-3",
                              ].join(" ")}
                            >
                              {job.description ?? "—"}
                            </p>

                            {isExpandable && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(id)}
                                className="mt-1 font-alt text-[14px] leading-[20px] tracking-[0.02em] text-[#4D31EC] hover:underline"
                                aria-expanded={isOpen}
                                aria-controls={`desc-${id}`}
                              >
                                {isOpen ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>

                          {/* location + salary */}
                          <div className="mt-4 flex items-center gap-6 font-alt text-[16px] tracking-[0.03em] text-slate-600">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 text-slate-600"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {job.location}
                              </span>
                            )}
                            {job.salaryRange && <span>₹ {job.salaryRange}</span>}
                          </div>

                          {/* CTA sits ~20px below the location row */}
                          <a
                            href={`/jobs/${job._id || job.id}`}
                            className="mt-[20px] block w-full rounded-xl bg-[#4D31EC] py-3 text-center font-alt text-[16px] tracking-[0.03em] text-white hover:brightness-110"
                          >
                            Apply now
                          </a>

                          {/* tags (optional) below CTA */}
                          {!!job.tags?.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {job.tags.slice(0, 6).map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-[12px] text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
