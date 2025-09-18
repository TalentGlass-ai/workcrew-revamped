"use client";

import * as React from "react";
import { Star, Check } from "lucide-react"; // optional; remove if not using lucide

type Stat = { value: string; labelTop?: string; labelBottom?: string };

const StatPill: React.FC<{ stat: Stat }> = ({ stat }) => (
  <div className="flex w-full items-center gap-4 rounded-2xl border border-[#D8E0FF] bg-white/80 px-6 py-5">
    <div className="rounded-xl bg-[#EEF0FF] px-4 py-3 text-center">
      <div
        className="text-[20px] font-semibold leading-none text-[#4D31EC]"
        style={{ fontFamily: "var(--font-sans)" }} // Archivo
      >
        {stat.value}
      </div>
      {(stat.labelTop || stat.labelBottom) && (
        <div
          className="mt-1 w-[88px] text-[12px] leading-[14px] text-[#394150]/80"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {stat.labelTop}
          <br />
          {stat.labelBottom}
        </div>
      )}
    </div>

    <div
      className="text-[16px] leading-[27px] tracking-[0.03em] text-[#101828]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* The pill can optionally carry extra copy next to the number; keep empty to match left pills */}
    </div>
  </div>
);

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="inline-flex items-center gap-2 rounded-full border border-[#D8E0FF] bg-white px-3 py-1 text-[13px] text-[#5E6AD9]"
    style={{ fontFamily: "var(--font-sans)" }}
  >
    ⚡ {children}
  </span>
);

const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div
    className={`rounded-2xl border border-[#D8E0FF] bg-white/80 p-6 ${className ?? ""}`}
  >
    {children}
  </div>
);

const H4: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h4
    className="text-[20px] font-medium leading-[27px] tracking-[0.03em] text-[#101828]"
    style={{ fontFamily: "var(--font-sans)" }} // Archivo Medium 20
  >
    {children}
  </h4>
);

const P: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <p
    className={`text-[16px] leading-[27px] tracking-[0.03em] text-[#475467] ${className ?? ""}`}
    style={{ fontFamily: "var(--font-sans)" }} // Archivo 16/27
  >
    {children}
  </p>
);

export default function WhyLoveUs() {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-[1094px]">
        {/* Top badge */}
        <div className="mb-5 flex justify-center">
          <Chip>We’re here for a reason</Chip>
        </div>

        {/* Title */}
        <h2
          className="text-center text-[48px] font-medium leading-[1] tracking-[0.01em] text-[#0B0B0F]"
          style={{ fontFamily: "var(--font-display)" }} // Schibsted Grotesk
        >
          Why{" "}
          <span className="text-[#4D31EC]">
            professionals and teams
          </span>{" "}
          love us
        </h2>

        {/* Subhead */}
        <p
          className="mt-4 text-center text-[16px] leading-[27px] tracking-[0.03em] text-[#475467]"
          style={{ fontFamily: "var(--font-sans)" }} // Archivo
        >
          Whether you are hiring or job searching, we help you move forward with
          clarity, speed, and confidence.
        </p>

        {/* Content box (1094×760 area -> inner box 978×~550 per spec) */}
        <div className="mt-10 rounded-3xl bg-[#C3BFFF1C] p-6 md:p-8">
          <div className="mx-auto grid max-w-[978px] grid-cols-1 gap-7">
            {/* Row 1: two stat pills + long card */}
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="flex flex-col gap-7">
                  <StatPill stat={{ value: "500+", labelTop: "Partner", labelBottom: "companies" }} />
                  <StatPill stat={{ value: "100%", labelTop: "Verified", labelBottom: "jobs" }} />
                </div>
              </div>

              <Card className="md:col-span-2">
                <H4>Only real jobs from real teams</H4>
                <P className="mt-2">
                  Verified companies only. No fake jobs or time-wasting interviews.
                </P>
              </Card>
            </div>

            {/* Row 2: three feature cards */}
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              <Card>
                <H4>Fast &amp; efficient</H4>
                <P className="mt-2">
                  Our streamlined process eliminates unnecessary delays.
                </P>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <H4>Average hiring time</H4>
                  <div className="rounded-xl bg-[#EEF0FF] px-3 py-2 text-[14px] font-semibold text-[#4D31EC]" style={{ fontFamily: "var(--font-sans)" }}>
                    2 Weeks
                  </div>
                </div>
                <P className="sr-only">Average time from posting to hire</P>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <H4>Better matches, faster</H4>
                  <div className="rounded-xl bg-[#FFF4E5] px-3 py-2 text-[14px] font-semibold text-[#B76E00]" style={{ fontFamily: "var(--font-sans)" }}>
                    <span className="inline-flex items-center gap-1">
                      {/* five stars */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} size={14} fill="currentColor" className="inline-block" />
                      ))}
                    </span>
                  </div>
                </div>
                <P className="mt-2">5/5 Satisfaction</P>
                <P className="mt-1">
                  We prioritize long-term fit by aligning roles with goals, and
                  people with purpose.
                </P>
              </Card>
            </div>

            {/* Row 3: green checklist + copy card */}
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              <div className="rounded-2xl border border-[#D8E0FF] bg-[#ECFDF3] p-6">
                <ul
                  className="space-y-3 text-[16px] leading-[27px] tracking-[0.03em] text-[#14532D]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {[
                    "Salary transparency",
                    "Real-time updates",
                    "Constructive feedback",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-1" size={18} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card>
                <H4>Fair, open process</H4>
                <P className="mt-2">
                  Access clear timelines, salary ranges, and feedback — so
                  everyone stays informed and aligned.
                </P>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
