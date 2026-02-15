"use client";

import * as React from "react";
import GlassPill from "@/components/primitives/tags/GlassPill"; // ✅ reuse the shared pill

/* ————— Small helpers ————— */
const SectionTitle: React.FC = () => (
  <h2
    className="text-center text-black"
    style={{
      fontFamily: "var(--font-display)", // Schibsted Grotesk
      fontWeight: 500, // Medium
      fontSize: "48px",
      lineHeight: "68px", // 48 + ~20 spacing
      letterSpacing: "0.01em", // 1%
    }}
  >
    Why <span style={{ color: "#4D31EC" }}>professionals and teams</span> love us
  </h2>
);

const SubTitle: React.FC = () => (
  <p
    className="mt-4 text-center text-[#475467]"
    style={{
      fontFamily: "var(--font-sans)", // Archivo
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "27px",
      letterSpacing: "0.03em",
    }}
  >
    Whether you are hiring or job searching, we help you move forward with
    clarity, speed, and confidence.
  </p>
);

/* ————— First row stat pills ————— */
const MiniStatPill: React.FC<{
  value: string;
  top: string;
  bottom?: string;
  width: number;
  height: number;
}> = ({ value, top, bottom, width, height }) => (
  <div
    className="rounded-[12px] px-4 py-3 text-center"
    style={{
      width,
      height,
      background: "rgba(195,191,255,0.11)", // C3BFFF @ 11%
    }}
  >
    <div
      className="mb-2 text-[20px] font-semibold leading-[27px] text-[#4D31EC]"
      style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}
    >
      {value}
    </div>
    <div
      className="mx-auto text-[16px] leading-[27px] text-[#101828]"
      style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}
    >
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

/* ————— Titles & bodies inside stroked cards ————— */
const CardTitleSpec: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h4
    style={{
      fontFamily: "var(--font-sans)", // Archivo
      fontWeight: 500, // Medium
      fontSize: "20px",
      lineHeight: "27px",
      letterSpacing: "0.03em",
      color: "#101828",
    }}
  >
    {children}
  </h4>
);

const CardBodySpec: React.FC<React.PropsWithChildren> = ({ children }) => (
  <p
    style={{
      fontFamily: "var(--font-sans)", // Archivo
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: "22px",
      letterSpacing: "0.03em",
      color: "#101828",
    }}
  >
    {children}
  </p>
);

/* ————— Time pill ————— */
const TimePill: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center rounded-[12px]"
    style={{
      width: 158,
      height: 107,
      background: "rgba(169,195,247,0.10)",
    }}
  >
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "27px",
        letterSpacing: "0.03em",
        color: "#3171EC",
      }}
    >
      2 Weeks
    </div>
    <div
      className="mt-2 text-center"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "22px",
        letterSpacing: "0.03em",
        color: "#A2A2A2",
      }}
    >
      Average hiring
      <br />
      time
    </div>
  </div>
);

/* ————— Rating pill ————— */
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
  <div
    className="flex items-center justify-center rounded-[12px]"
    style={{ width: 160, height: 79, background: "#FFF5E5" }} // widened to 160
  >
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: 140, height: 59 }} // widened inner
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "22px",
          letterSpacing: "0.03em",
          color: "#000000",
          whiteSpace: "nowrap", // prevent wrapping
        }}
      >
        5/5 Satisfaction
      </div>
    </div>
  </div>
);

/* ————— Green checklist icon ————— */
const CheckIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#006C1F"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function WhyLoveUs(): React.ReactElement {
  return (
    <section className="relative w-full py-16">
      <div className="mx-auto w-full max-w-[1094px] px-4 md:px-0">
        {/* Badge pill — now using the shared GlassPill */}
        <div className="mb-5 flex justify-center">
          <GlassPill text="We’re here for a reason" iconColor="#2288FE" />
        </div>

        {/* Title + subtitle */}
        <SectionTitle />
        <SubTitle />

        {/*  Content */}
        <div className="relative mt-10 flex flex-col gap-6">
          {/* Box 1: Only real jobs… */}
          <div className="rounded-xl border border-[#C7C4FF] bg-white p-6">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_1fr]">
              <div className="flex items-stretch justify-center gap-4 md:justify-start">
                <MiniStatPill
                  value="500+"
                  top="Partner"
                  bottom="companies"
                  width={136}
                  height={102}
                />
                <MiniStatPill
                  value="100+"
                  top="Verified jobs"
                  width={92}
                  height={102}
                />
              </div>

              {/* moved 40px right */}
              <div className="pl-[40px]">
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "20px",
                    lineHeight: "27px",
                    letterSpacing: "0.03em",
                    color: "#101828",
                  }}
                >
                  Only real jobs from real teams
                </h4>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "22px",
                    letterSpacing: "0.03em",
                    color: "#475467",
                  }}
                >
                  Verified companies only. No fake jobs or time-wasting interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Row with two fixed-size cards */}
          <div className="flex flex-col items-center gap-[30px] md:flex-row md:justify-between">
            {/* Box 2: Fast & efficient */}
            <div className="rounded-xl border border-[#C7C4FF] bg-white p-6 w-[532px] h-[180px]">
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
            <div className="rounded-xl border border-[#C7C4FF] bg-white p-6 w-[532px] h-[180px]">
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
              <div
                className="flex flex-col justify-center rounded-[12px] p-4"
                style={{ width: 275, height: 119, background: "#DFF5E6" }}
              >
                <ul className="space-y-3">
                  {[
                    "Salary transparency",
                    "Real time updates",
                    "Constructive feedback",
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-2"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "22px",
                        letterSpacing: "0.03em",
                        color: "#006C1F",
                      }}
                    >
                      <CheckIcon /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: text */}
              <div className="flex flex-col justify-center">
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "20px",
                    lineHeight: "27px",
                    letterSpacing: "0.03em",
                    color: "#101828",
                  }}
                >
                  Fair, open process
                </h4>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "22px",
                    letterSpacing: "0.03em",
                    color: "#101828",
                  }}
                >
                  Access clear timelines, salary ranges, and feedback - so everyone
                  stays informed and aligned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
