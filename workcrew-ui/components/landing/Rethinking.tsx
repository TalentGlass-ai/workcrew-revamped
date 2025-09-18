"use client";

import * as React from "react";

/**
 * Rethinking how you hire and get hired
 * - 1100×632-ish gradient panel
 * - Left: recruiter bullets + Hire now button
 * - Right: demo panel (video/img placeholder)
 */
export default function RethinkingSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D8E0FF] bg-white/70 px-3 py-1 text-xs text-[#5E6AD9] shadow-sm">
          <span className="text-base">⚡</span> We’re here for a reason
        </div>

        {/* Heading + subcopy */}
        <h2 className="font-[var(--font-display)] text-[40px] leading-[1.1] md:text-[56px]">
          <span className="text-[#4D31EC]">Rethinking</span>{" "}
          <span className="text-black">how you hire and get hired</span>
        </h2>
        <p
          className="mt-3 max-w-[900px] text-[20px] leading-[27px] tracking-[0.03em] text-slate-700"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
        >
          Build your dream team or find your next move with WorkCrew.ai, all in
          one place, without clutter or chaos.
        </p>

        {/* Big gradient panel (≈1100×632 in Figma) */}
        <div
          className="mt-8 rounded-[14px] p-6 md:p-10"
          style={{
            // very light purple wash
            background:
              "linear-gradient(180deg, rgba(77,49,236,0.08) 0%, rgba(245,247,254,0.90) 100%)",
          }}
        >
          <div className="grid gap-10 md:grid-cols-[1fr,1fr] md:gap-24">
            {/* LEFT column */}
            <div>
              <div
                className="mb-6 text-[18px] font-semibold text-[#5B4BFF]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                If you're a recruiter:
              </div>

              {/* Bullets block (496 × 295 Hug in Figma) */}
              <div className="flex w-full max-w-[496px] flex-col gap-[10px]">
                {/* Selected */}
                <div className="rounded-[12px] border-2 border-[#5B4BFF] bg-white p-4 shadow-sm">
                  <div
                    className="text-[16px] font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Post roles in minutes with AI generated JDs
                  </div>
                  <div className="mt-2 text-[14px] text-slate-600">
                    Generate optimized job descriptions instantly with AI.
                  </div>
                </div>

                {/* Items */}
                <ItemRow label="Screen for quality" />
                <ItemRow label="View assessment backed profiles" />
                <ItemRow label="Real time candidate matching" />
              </div>

              {/* CTA + secondary link */}
              <div className="mt-8">
                <CtaHireNow href="#hire-now" />
                <div className="mt-4 text-sm">
                  I’m a{" "}
                  <a href="#candidate" className="text-[#4D31EC] underline">
                    candidate!
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT column: demo panel (368 × 371, r=9) */}
            <div className="flex items-start justify-center md:justify-end">
              <div className="w-[368px] rounded-[9px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-[#E9ECF6]">
                {/* tiny green header strip + label */}
                <div className="mb-3 rounded-[6px] bg-[#E9F5EA] px-3 py-2 text-[12px] font-semibold text-slate-700">
                  Job requirements
                </div>

                {/* faux input */}
                <div className="rounded-[8px] bg-[#F6F2FF] p-3 ring-1 ring-[#E7E3FF]">
                  <div className="rounded-[6px] bg-white px-3 py-2 text-[12px] text-slate-500 ring-1 ring-[#E7E3FF]">
                    Job title
                  </div>
                </div>

                {/* media placeholder (video/image) */}
                <div className="mt-4 h-[260px] rounded-[8px] bg-[#F8FAFF] ring-1 ring-[#EEF1FF]">
                  {/* If you have an mp4 from Figma, drop it at /public/media/JD.mp4 */}
                  <video
                    className="h-full w-full rounded-[8px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/media/JD.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 

      {/* CTA styles (triple ellipse) */}
      <style jsx>{`
        .cta-outer {
          width: 192px;            /* feels right for text + icon */
          height: 70px;
          border-radius: 34px;
          background: #c4d3ef6e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
        }
        .cta-middle {
          width: 169px;
          height: 56px;
          border-radius: 30px;
          background: #e7e3ff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .cta-inner {
          width: 100%;
          height: 100%;
          border-radius: 28px;
          background: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          font-family: var(--font-sans);  /* Archivo */
          font-weight: 600;               /* SemiBold */
          font-size: 16px;
          line-height: 1;
          letter-spacing: 0.02em;
          color: #3926cc;
        }
        .cta-inner:hover { filter: brightness(0.98); }
      `}</style>
    </section>
  );
}

/* ---------- bits ---------- */

function ItemRow({ label }: { label: string }) {
  return (
    <div className="rounded-[12px] bg-[#F7F5FF] p-4 ring-1 ring-[#E7E3FF]">
      <div
        className="text-[15px] font-medium text-slate-800"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </div>
    </div>
  );
}

function CtaHireNow({ href }: { href: string }) {
  return (
    <div className="cta-outer">
      <div className="cta-middle">
        <a href={href} className="cta-inner">
          <ArrowNortheast /> Hire now
        </a>
      </div>
    </div>
  );
}

function ArrowNortheast() {
  return (
    <svg
      className="shrink-0"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
