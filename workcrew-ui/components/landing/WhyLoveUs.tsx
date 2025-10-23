"use client";

import * as React from "react";
import GlassPill from "../primitives/tags/GlassPill";

/* Section headline + subheadline */
const SectionTitle: React.FC = () => (
  <h2 className="font-display text-[48px] font-medium leading-[68px] tracking-[0.01em] text-center text-black">
    Why <span className="text-[#4D31EC]">professionals and teams</span> love us
  </h2>
);

const SubTitle: React.FC = () => (
  <p className="mt-4 font-sans text-[20px] font-normal leading-[27px] tracking-[0.03em] text-center text-[#475467]">
    Whether you are hiring or job searching, we help you move forward with
    clarity, speed, and confidence.
  </p>
);

/* Small stat chip */
const MiniStatPill: React.FC<{
  value: string;
  top: string;
  bottom?: string;
  width: number;
  height: number;
}> = ({ value, top, bottom, width, height }) => (
  <div
    className={[
      "rounded-[12px] px-4 py-3 text-center bg-[rgba(195,191,255,0.11)]",
      `w-[${width}px] h-[${height}px]`,
    ].join(" ")}
  >
    <div className="mb-2 font-sans text-[20px] font-semibold leading-[27px] tracking-[0.03em] text-[#4D31EC]">
      {value}
    </div>
    <div className="mx-auto font-sans text-[16px] leading-[27px] tracking-[0.03em] text-[#101828]">
      {top}
      {bottom ? (
        <>
          <br />
          {bottom}
        </>
      ) : null}
    </div>
  </div>
);

/* Titles & bodies used inside stroked cards */
const CardTitleSpec: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <h4
    className={[
      "font-alt text-[20px] font-medium leading-[27px] tracking-[0.03em] text-[#101828]",
      className,
    ].join(" ")}
  >
    {children}
  </h4>
);

const CardBodySpec: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <p
    className={[
      "font-alt text-[16px] font-normal leading-[22px] tracking-[0.03em] text-[#101828]",
      className,
    ].join(" ")}
  >
    {children}
  </p>
);

/* Time metric chip */
const TimePill: React.FC = () => (
  <div className="flex h-[107px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-[rgba(169,195,247,0.10)]">
    <div className="font-sans text-[20px] font-medium leading-[27px] tracking-[0.03em] text-[#3171EC]">
      2 Weeks
    </div>
    <div className="mt-2 text-center font-sans text-[16px] font-normal leading-[22px] tracking-[0.03em] text-[#A2A2A2]">
      Average hiring
      <br />
      time
    </div>
  </div>
);

/* 5-star rating chip */
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

const RatingPill: React.FC = () => (
  <div className="flex h-[79px] w-[160px] items-center justify-center rounded-[12px] bg-[#FFF5E5]">
    <div className="flex h-[59px] w-[140px] flex-col items-center justify-center">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <div className="mt-1 whitespace-nowrap font-sans text-[16px] font-normal leading-[22px] tracking-[0.03em] text-black">
        5/5 Satisfaction
      </div>
    </div>
  </div>
);

/* Checkmark icon adopts parent text color via currentColor */
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
    <section className="relative w-full py-16">
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
                <MiniStatPill value="500+" top="Partner" bottom="companies" width={136} height={102} />
                <MiniStatPill value="100+" top="Verified jobs" width={92} height={102} />
              </div>

              <div className="pl-[40px]">
                <CardTitleSpec>Only real jobs from real teams</CardTitleSpec>
                <CardBodySpec className="mt-2 text-[#475467]">
                  Verified companies only. No fake jobs or time-wasting interviews.
                </CardBodySpec>
              </div>
            </div>
          </div>

          {/* Row with two fixed-size cards */}
          <div className="flex flex-col items-center gap-[30px] md:flex-row md:justify-between">
            {/* Box 2: Fast & efficient */}
            <div className="h-[180px] w-[532px] rounded-xl border border-[#C7C4FF] bg-white p-6">
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
            <div className="h-[180px] w-[532px] rounded-xl border border-[#C7C4FF] bg-white p-6">
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
              <div className="flex h-[119px] w-[275px] flex-col justify-center rounded-[12px] bg-[#DFF5E6] p-4">
                <ul className="space-y-3">
                  {["Salary transparency", "Real time updates", "Constructive feedback"].map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-2 font-sans text-[16px] font-normal leading-[22px] tracking-[0.03em] text-[#006C1F]"
                    >
                      <CheckIcon /> {t}
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
    </section>
  );
}
