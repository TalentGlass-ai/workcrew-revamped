"use client";

import Image from "next/image";
import React from "react";
import LogoMarquee from "./LogoMarquee";
import FeatureSlides from "./FeatureSlides";
import { T } from "../primitives/Typography";
import GlassPill from "../primitives/tags/GlassPill"; // ✅ new import

export default function HeroSection(): React.ReactElement {
  return (
    <section className="relative">
      <div className="hero-top relative overflow-hidden min-h-[740px]">
        {/* Backgrounds */}
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(246,247,252,0.95) 0%, rgba(236,239,248,0.92) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(163,157,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(163,157,255,0.25) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* LEFT SIDE CONTENT */}
        <div className="relative z-10 mx-auto max-w-[1440px] pl-[51px] pr-[51px] pb-24 md:pb-28">
          <div className="grid items-start gap-10 md:grid-cols-2 md:gap-8">
            <div className="mt-[100px]">
              {/* Eyebrow pill replaced with GlassPill */}
              <div className="mb-6">
                <GlassPill text="The future of hiring is here" iconColor="#4D31EC" />
              </div>

              {/* Headline */}
              <h1>
                <T
                  as="div"
                  font="schibsted"
                  weight={540}
                  className="text-[48px] tracking-[0.01em] text-[#4D31EC] text-left leading-[40px]"
                >
                  Hiring or job hunting?
                </T>
                <T
                  as="div"
                  font="schibsted"
                  weight={540}
                  className="mt-[20px] text-[48px] tracking-[0.01em] text-black text-left leading-[40px]"
                >
                  You’re in the right place.
                </T>
              </h1>

              {/* Subcopy */}
              <T
                as="p"
                font="archivo"
                weight={400}
                className="mt-6 max-w-[720px] text-[20px] tracking-[0.03em] text-black leading-[12px]"
                style={{ textWrap: "balance" as any }}
              >
                An AI-powered hiring experience that helps candidates find the
                right role and recruiters hire faster, smarter, better.
              </T>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  className="inline-flex h-[50px] items-center gap-2 rounded-full px-6 font-alt font-semibold text-[16px] tracking-[0.02em] text-[#4D31EC] leading-none transition hover:brightness-105 active:translate-y-[1px]"
                  style={{
                    borderWidth: "1.5px",
                    borderStyle: "solid",
                    borderColor: "#6C55FF",
                    background:
                      "linear-gradient(180deg, rgba(108,85,255,0.06) 0%, rgba(108,85,255,0.03) 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.95), 0 10px 22px rgba(91,75,255,0.18)",
                  }}
                >
                  <ArrowNortheast /> Find work
                </a>

                <a
                  href="#"
                  className="inline-flex h-[50px] items-center gap-2 rounded-full px-6 shadow-[0_10px_24px_rgba(91,75,255,0.28)] hover:brightness-105 font-alt font-semibold text-[16px] tracking-[0.02em] text-white leading-none"
                  style={{ background: "#5B4BFF" }}
                >
                  <ArrowNortheast /> Start hiring
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid max-w-lg grid-cols-4 gap-6 text-center md:text-left">
                <Stat number="5,000+" label="Candidates" />
                <Stat number="500+" label="Recruiters" />
                <Stat number="300+" label="Companies" />
                <Stat number="400+" label="Jobs Posted" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HERO IMAGE */}
        <div className="relative z-10 mx-auto mt-10 w-[510px] max-w-[92vw] md:absolute md:right-6 md:top-1/2 md:mt-0 md:-translate-y-1/2">
          <div
            className="relative rounded-[24px] overflow-hidden"
            style={{ width: "510px" }}
          >
            <div className="min-h-[320px]">
              <Image
                src="/hero-right.png"
                alt="WorkCrew preview"
                width={510}
                height={420}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo marquee */}
      <div className="mt-6 md:mt-8">
        <LogoMarquee
          heightMax={64}
          heightMin={40}
          heightVw={8}
          repeat={32}
          speed={28}
        />
      </div>

      {/* Statement block */}
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-36 md:pt-40 md:pb-48">
        <div className="h-px w-full bg-[#E5E7EB] mb-14 md:mb-16" />
        <div className="text-center">
          <T
            as="div"
            font="schibsted"
            weight={540}
            className="text-[40px] tracking-[0.01em] text-black leading-[52px]"
          >
            “Recruiting &amp; job searching are fundamentally broken” – They say.
          </T>

          <div style={{ marginTop: "20px" }}>
            <T
              as="div"
              font="schibsted"
              weight={540}
              className="text-[36px] tracking-[0.01em] text-[#4D31EC] leading-[28px]"
            >
              But we have solved every problem for you
            </T>
          </div>
        </div>
        <div className="h-px w-full bg-[#E5E7EB] mt-14 md:mt-16" />
      </div>

      <FeatureSlides />
    </section>
  );
}

/*  small UI bits  */
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <T
        as="div"
        font="schibsted"
        weight={540}
        className="text-[20px] tracking-[0.01em] text-black leading-[14px]"
      >
        {number}
      </T>
      <T
        as="div"
        font="schibsted"
        weight={540}
        className="text-[14px] tracking-[0.01em] text-[#7B72AF] leading-[10px]"
      >
        {label}
      </T>
    </div>
  );
}

function ArrowNortheast() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M7 17L17 7M7 7h10v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
