"use client";

import * as React from "react";
import T from "../primitives/Typography";
import GlassPill from "../primitives/tags/GlassPill";

/* section heading + subheading — routed through <T /> so typography stays consistent */
const SectionTitle: React.FC = () => (
  <T as="h2" variant="hero48" className="text-center text-black leading-[68px] font-medium">
    Why <span className="text-[#4D31EC]">professionals and teams</span> love us
  </T>
);

const SubTitle: React.FC = () => (
  <T
    as="p"
    variant="sub20"
    className="mt-4 text-center text-[#475467] leading-[27px] font-normal"
    trackingPct={3}
  >
    Whether you are hiring or job searching, we help you move forward with
    clarity, speed, and confidence.
  </T>
);

/* micro stat chip — fixed sizes via a small size variant (no inline style, no purge issues) */
const MiniStatPill: React.FC<{
  value: string;
  top: string;
  bottom?: string;
  size?: "lg" | "sm";
}> = ({ value, top, bottom, size = "lg" }) => {
  const box = size === "lg" ? "h-[102px] w-[136px]" : "h-[102px] w-[92px]";
  return (
    <div className={`rounded-[12px] px-4 py-3 text-center bg-[rgba(195,191,255,0.11)] ${box}`}>
      <T as="div" variant="sub20" className="mb-2 text-[#4D31EC] font-semibold leading-[27px]">
        {value}
      </T>
      <T as="div" variant="body16" className="mx-auto text-[#101828] leading-[27px]" trackingPct={3}>
        {top}
        {bottom ? (
          <>
            <br />
            {bottom}
          </>
        ) : null}
      </T>
    </div>
  );
};

/* card text primitives — use T so every card stays on-brand */
const CardTitleSpec: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <T as="h4" variant="sub20" className={`text-[#101828] leading-[27px] font-medium ${className}`}>
    {children}
  </T>
);

const CardBodySpec: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <T as="p" variant="body16" className={`text-[#101828] leading-[22px] ${className}`}>
    {children}
  </T>
);

/* time chip — tiny stat block with two text rows */
const TimePill: React.FC = () => (
  <div className="flex h-[107px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-[rgba(169,195,247,0.10)]">
    <T as="div" variant="sub20" className="text-[#3171EC] leading-[27px] font-medium">
      2 Weeks
    </T>
    <T as="div" variant="body16" className="mt-2 text-center text-[#A2A2A2] leading-[22px]">
      Average hiring
      <br />
      time
    </T>
  </div>
);

/* star icon for rating pill — uses fill, not text color */
const StarIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="#FFA500"
  >
    <path d="M12 2.25l2.902 5.883 6.493.944-4.697 4.578 1.109 6.463L12 17.77l-5.807 3.348 1.109-6.463-4.697-4.578 6.493-.944L12 2.25z" />
  </svg>
);

/* rating chip — five stars + label */
const RatingPill: React.FC = () => (
  <div className="flex h-[79px] w-[160px] items-center justify-center rounded-[12px] bg-[#FFF5E5]">
    <div className="flex h-[59px] w-[140px] flex-col items-center justify-center">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <T as="div" variant="body16" className="mt-1 whitespace-nowrap text-black leading-[22px]">
        5/5 Satisfaction
      </T>
    </div>
  </div>
);

/* simple check icon that inherits currentColor */
const CheckIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function WhyLoveUs(): React.ReactElement {
  return (
    /* no external spacing — page decides the gaps between sections */
    <section className="relative w-full !my-0 !py-0">
      {/* inner vertical breathing */}
      <div className="py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1094px] px-4 md:px-0">
          <div className="mb-5 flex justify-center">
            <GlassPill text="We’re here for a reason" iconColor="#2288FE" />
          </div>

          <SectionTitle />
          <SubTitle />

          <div className="relative mt-10 flex flex-col gap-6">
            {/* Box 1: Only real jobs… */}
            <div className="rounded-xl border border-[#C7C4FF] bg-white p-6">
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_1fr]">
                <div className="flex items-stretch justify-center gap-4 md:justify-start">
                  <MiniStatPill value="500+" top="Partner" bottom="companies" size="lg" />
                  <MiniStatPill value="100+" top="Verified jobs" size="sm" />
                </div>

                <div className="md:pl-[40px]">
                  <CardTitleSpec>Only real jobs from real teams</CardTitleSpec>
                  <CardBodySpec className="mt-2 text-[#475467]">
                    Verified companies only. No fake jobs or time-wasting interviews.
                  </CardBodySpec>
                </div>
              </div>
            </div>

            {/* Row with two fixed-size cards (responsive) */}
            <div className="flex flex-col items-stretch gap-[30px] md:flex-row md:justify-between">
              {/* Box 2: Fast & efficient */}
              <div className="h-auto w-full rounded-xl border border-[#C7C4FF] bg-white p-6 md:h-[180px] md:w-[532px]">
                <div className="flex h-full items-center justify-between">
                  <div className="pr-4">
                    <CardTitleSpec>Fast &amp; efficient</CardTitleSpec>
                    <CardBodySpec>
                      Our streamlined process
                      <br />
                      eliminates unnecessary delays.
                    </CardBodySpec>
                  </div>
                  <TimePill />
                </div>
              </div>

              {/* Box 3: Better matches, faster */}
              <div className="h-auto w-full rounded-xl border border-[#C7C4FF] bg-white p-6 md:h-[180px] md:w-[532px]">
                <div className="flex h-full items-center justify-between">
                  <div className="pr-4">
                    <CardTitleSpec>Better matches, faster</CardTitleSpec>
                    <CardBodySpec>
                      We prioritize long-term fit by
                      <br />
                      aligning roles with goals,
                      <br />
                      and people with purpose.
                    </CardBodySpec>
                  </div>
                  <RatingPill />
                </div>
              </div>
            </div>

            {/* Box 4: Fair, open process */}
            <div className="rounded-xl border border-[#C7C4FF] bg-white p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left: green checklist */}
                <div className="flex h-[119px] w-full max-w-[275px] flex-col justify-center rounded-[12px] bg-[#DFF5E6] p-4">
                  <ul className="space-y-3 text-[#006C1F]">
                    {["Salary transparency", "Real time updates", "Constructive feedback"].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <CheckIcon />
                        <T as="span" variant="body16" className="leading-[22px]">
                          {t}
                        </T>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-center">
                  <CardTitleSpec>Fair, open process</CardTitleSpec>
                  <CardBodySpec className="mt-2">
                    Access clear timelines, salary ranges, and feedback – so everyone
                    stays informed and aligned.
                  </CardBodySpec>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{/* /internal padding */}
    </section>
  );
}
