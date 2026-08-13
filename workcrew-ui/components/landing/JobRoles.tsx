"use client";

import { useEffect, useRef, useState } from "react";
import type { Job } from '@/types/index';
import { getCompanyName } from '@/workcrew-ui/lib/utils/jobUtils';
import { formatPay } from '@/lib/pay';
import GlassPill from "@/components/primitives/tags/GlassPill";
import LayeredPill, { ArrowNortheastIcon } from "@/components/primitives/buttons/LayeredPill"; // ✅ new reusable pill

export default function JobRoles() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [canExpand, setCanExpand] = useState<Record<string, boolean>>({});
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const getId = (j: Job) => String(j._id || j.id || j.title || Math.random());

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/jobs/search?limit=12`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: Job[] = (json?.jobs ?? []).map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.organization?.name ?? null,
          description: j.description ?? "",
          location: j.location ?? "",
          type: j.jobType ?? "",
          tags: Array.isArray(j.requiredSkills) ? j.requiredSkills : [],
          salaryRange: (j.salaryMin || j.salaryMax) ? formatPay(j.salaryMin, j.salaryMax, j.currency) : "",
        }));
        if (!cancelled) setJobs(list);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load jobs';
        if (!cancelled) setErr(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const SCROLL = 519 + 24;
  const scrollBy = (px: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: px, behavior: "smooth" });
  };

  const toggleExpand = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <section className="w-full px-0 pt-16 pb-10 overflow-x-hidden relative">
      {/* Header */}
      <header className="mb-10 text-center px-6">
        <GlassPill text="For candidates" iconColor="#2288FE" />

        <div className="mx-auto mt-4 w-[663px] max-w-full whitespace-nowrap">
          <h2 className="font-[540] text-[48px] leading-[59px] tracking-[0.01em] text-center">
            <span className="text-[#4D31EC]">Discover</span>{" "}
            <span className="text-black">roles made for you!</span>
          </h2>
        </div>

        <p className="mx-auto mt-3 max-w-none whitespace-nowrap text-[20px] leading-[27px] tracking-[0.03em] text-black text-center">
          From startups to big companies, discover roles that match your skills and career aspirations
        </p>
      </header>

      {/* Layout area */}
      <div className="relative md:min-h-[365px]">
        {/* Sidebar */}
        <aside className="hidden md:block absolute left-[88px] top-0 w-[164px] h-[365px]">
          <ul className="space-y-6">
            <li className="relative flex items-center gap-2 whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="text-[#4D31EC] w-[20.2px] h-[36px]"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              <span
                className={`
                  font-archivo font-medium text-[16px] tracking-[0.03em] text-[#4D31EC]
                  before:absolute before:-bottom-2 before:left-0 before:h-[3px] before:w-28 before:bg-[#4D31EC]
                `}
              >
                Development
              </span>
            </li>
            <li className="font-archivo font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2] whitespace-nowrap">
              Design
            </li>
            <li className="font-archivo font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2] whitespace-nowrap">
              Product management
            </li>
            <li className="font-archivo font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2] whitespace-nowrap">
              Marketing
            </li>
            <li className="font-archivo font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2] whitespace-nowrap">
              Customer service
            </li>
            <li className="font-archivo font-medium text-[16px] tracking-[0.03em] text-[#A2A2A2] whitespace-nowrap">
              Sales
            </li>
          </ul>

          {/* ✅ Reusable More jobs pill */}
          <div className="mt-10">
            <LayeredPill
              href="/jobs"
              label="More jobs"
              icon={<ArrowNortheastIcon />}
              size="md"
            />
          </div>
        </aside>

        {/* Cards wrapper */}
        <div className="absolute left-[460px] top-0 right-0">
          <div className="relative overflow-hidden px-6 md:pl-[40px] md:pr-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent"
            />

            {/* arrows */}
            <button
              onClick={() => scrollBy(-SCROLL)}
              aria-label="Previous"
              className="
                absolute left-0 top-1/2 hidden h-9 w-9 -translate-y-1/2
                items-center justify-center rounded-full bg-white ring-1 ring-slate-200
                hover:bg-slate-50 md:flex z-[2]
              "
              title="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => scrollBy(SCROLL)}
              aria-label="Next"
              className="
                absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2
                items-center justify-center rounded-full bg-white ring-1 ring-slate-200
                hover:bg-slate-50 md:flex z-[2]
              "
              title="Next"
            >
              ›
            </button>

            {/* track */}
            <div
              ref={trackRef}
              className="overflow-x-auto overflow-y-hidden px-2 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

              <div className="flex gap-6">
                {/* Skeletons */}
                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-none w-[519px] snap-start rounded-2xl border border-[#E7EAFF] bg-white/70 p-6 animate-pulse overflow-hidden"
                    >
                      <div className="h-6 w-40 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
                      <div className="mt-6 h-20 w-full rounded bg-slate-100" />
                      <div className="mt-6 h-12 w-full rounded bg-slate-200" />
                    </div>
                  ))}

                {!loading && err && <div className="text-rose-600">{err}</div>}
                {!loading && !err && jobs.length === 0 && (
                  <div className="text-slate-500">No jobs found.</div>
                )}

                {/* Cards */}
                {!loading &&
                  !err &&
                  jobs.map((job) => {
                    const id = getId(job);
                    const isOpen = !!expanded[id];
                    const isExpandable = !!canExpand[id];

                    return (
                      <article
                        key={id}
                        className="flex-none w-[519px] snap-start rounded-2xl border border-[#E7EAFF] bg-white p-6 overflow-hidden flex flex-col"
                      >
                        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                          <div className="min-w-0">
                            <div className="text-[20px] leading-[23px] tracking-[0.03em] text-black font-medium break-words">
                              {job.title || "Untitled role"}
                            </div>
                            <div className="mt-1 text-[20px] leading-[23px] tracking-[0.03em] font-medium text-[#4D31EC] break-words">
                              {getCompanyName(job.company)}
                            </div>
                          </div>

                          {job.type && (
                            <span className="justify-self-end self-start inline-flex h-[32px] items-center rounded-full bg-[#EEF0FF] px-3">
                              <span className="font-archivo font-semibold text-[16px] leading-[23px] tracking-[0.03em] text-[#4D31EC]">
                                {job.type}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* body */}
                        <div className="mt-4 flex flex-col" style={{ minHeight: 180 }}>
                          <div>
                            <p
                              id={`desc-${id}`}
                              ref={setDescRef(id)}
                              className={[
                                "font-archivo text-[16px] leading-[23px] tracking-[0.03em] text-slate-700",
                                isOpen ? "line-clamp-none" : "line-clamp-3",
                              ].join(" ")}
                              style={{ minHeight: "46px" }}
                            >
                              {job.description ?? "—"}
                            </p>

                            {isExpandable && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(id)}
                                className="mt-1 text-[14px] leading-[20px] tracking-[0.02em] font-archivo text-[#4D31EC] hover:underline"
                                aria-expanded={isOpen}
                                aria-controls={`desc-${id}`}
                              >
                                {isOpen ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>

                          <div className="mt-4 flex items-center gap-6 font-archivo text-[16px] tracking-[0.03em] text-slate-600">
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
                            {job.salaryRange && <span>{job.salaryRange}</span>}
                          </div>

                          {!!job.tags?.length && (
                            <div className="mt-4 flex flex-wrap gap-2">
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

                        {/* CTA */}
                        <a
                          href={`/jobs/${job._id || job.id}`}
                          className="mt-auto block w-full rounded-xl bg-[#4D31EC] py-3 text-center font-archivo text-[16px] tracking-[0.03em] text-white hover:brightness-110"
                        >
                          Apply now
                        </a>
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
