"use client";

import Image from "next/image";
import React from "react";
import LogoMarquee from "./LogoMarquee"; 

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle grid & the soft top gradient stuff */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(236,239,255,0.6),transparent_40%),linear-gradient(90deg,rgba(255,255,255,0.6),transparent_30%),radial-gradient(600px_200px_at_50%_-80px,#E7E9FF_0%,transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(#edf0ff_1px,transparent_1px),linear-gradient(90deg,#edf0ff_1px,transparent_1px)] [background-size:40px_40px] opacity-40"
      />

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-10 md:pt-28 md:pb-20">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="WorkCrew.ai"
              width={102}
              height={26}
              priority
              className="h-[26px] w-auto"
            />
          </div>

          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#">Pricing</a>
            <a className="hover:text-slate-900" href="#">Find jobs</a>
            <a className="hover:text-slate-900" href="#">Blogs</a>
            <a className="hover:text-slate-900" href="#">About us</a>
            <a className="hover:text-slate-900" href="#">Contact</a>
          </nav>

          <button className="hidden rounded-full bg-gradient-to-b from-[#6C79FF] to-[#4C43D5] px-6 py-2.5 text-white shadow-[0_6px_24px_rgba(102,96,255,0.35)] ring-1 ring-inset ring-white/30 md:block">
            Login
          </button>
        </header>

        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-8">
          {/* Left one */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D8E0FF] bg-white/60 px-3 py-1 text-xs text-[#5E6AD9] shadow-sm backdrop-blur">
              <span className="text-base">⚡</span> The future of hiring is here
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#4E35F2] md:text-[56px] md:leading-[64px]">
              Hiring or job hunting?
              <br />
              <span className="bg-gradient-to-b from-black to-black/70 bg-clip-text text-transparent">
                You’re in the right place.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-600">
              An AI-powered hiring experience that helps candidates find the
              right role and recruiters hire faster, smarter, better.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-[#D9E2FF] bg-white px-4 py-2 text-sm font-medium text-[#2F46F6] shadow-sm hover:bg-slate-50"
              >
                <ArrowNortheast /> Find work
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-[#5B4BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(91,75,255,0.35)] hover:brightness-105"
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

          {/* RIGHT: product card */}
          <div className="relative">
            <div className="rounded-3xl border border-[#E6E9FF] bg-white/90 p-6 shadow-[0_20px_60px_rgba(76,67,213,0.08)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="WorkCrew.ai"
                    width={84}
                    height={22}
                    className="h-[22px] w-auto"
                  />
                  <Image
                    src="/laptopLadyOnCard.png"
                    alt="User avatar"
                    width={45}
                    height={45}
                    className="h-[45px] w-[45px] rounded-full object-cover"
                  />
                </div>
                <div className="h-2 w-40 rounded-full bg-[#EDEAFE]" />
              </div>

              {/* Profile completion */}
              <div className="mb-5 rounded-xl border border-[#E6E9FF] p-4 shadow-[0_2px_0_rgba(76,67,213,0.05)]">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Profile completion
                </div>
                <Progress value={66} />
              </div>

              {/* Job matches */}
              <div className="mb-5 rounded-xl border border-[#E6E9FF] p-4">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Job matches
                </div>

                <JobRow
                  title="Senior Frontend Developer"
                  meta="TechCorp • Remote • $120k–150k"
                />
                <div className="my-3 h-px bg-[#EEF1FF]" />
                <JobRow
                  title="React Engineer"
                  meta="StartupXYZ • Hybrid • $100k–130k"
                />
              </div>

              {/* Recent applications */}
              <div className="rounded-xl border border-[#E6E9FF] p-4">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Recent Applications
                </div>

                <AppRow
                  title="Frontend Developer at InnovateLabs"
                  badge={{ label: "Under Review", tone: "amber" }}
                />
                <div className="my-3 h-px bg-[#EEF1FF]" />
                <AppRow
                  title="React Engineer at DevCorp"
                  badge={{ label: "Interview Scheduled", tone: "green" }}
                />
              </div>
            </div>

            {/* Floating chatbot avatar (bottom-right of card) */}
            <Image
              src="/ChatbotLady.png"
              alt="Chatbot"
              width={64}
              height={64}
              className="absolute -bottom-8 right-4 h-16 w-16 rounded-full border-4 border-white shadow-[0_10px_24px_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>

        {/* ---- LogoMarquee below grid ---- */}
        <div className="mt-12 md:mt-16">
          <LogoMarquee />
        </div>
        <div className="mx-auto my-10 h-px w-full max-w-3xl bg-[#EEF1FF]" />

        {/* ---- “Recruiting … broken” statement ---- */}
        <div className="mx-auto max-w-[717px] text-center">
          <h2 className="mb-6 text-[28px] md:text-[32px] font-extrabold leading-tight tracking-tight text-slate-900">
            “Recruiting &amp; job searching are fundamentally broken” – They say.
          </h2>

          <a
            href="#solution"
            className="text-[18px] md:text-[20px] font-medium text-[#4C43D5] underline decoration-[#5B4BFF] decoration-2 underline-offset-4 hover:opacity-90"
          >
            But we have solved every problem for you
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- small UI bits ---------- */

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-lg font-extrabold text-slate-900">{number}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-[#ECECFA]">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-[#7C7BFF] to-[#4C43D5]"
        style={{ width: `${value}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        role="progressbar"
      />
      <div className="mt-1 text-right text-xs font-semibold text-[#5E60FF]">
        {value}%
      </div>
    </div>
  );
}

function JobRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{meta}</div>
      </div>
      <button className="rounded-lg bg-[#5B4BFF] px-4 py-1.5 text-sm font-semibold text-white shadow hover:brightness-110">
        Apply
      </button>
    </div>
  );
}

function AppRow({
  title,
  badge,
}: {
  title: string;
  badge: { label: string; tone: "amber" | "green" };
}) {
  const tone =
    badge.tone === "amber"
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : "bg-emerald-100 text-emerald-700 ring-emerald-200";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-slate-700">{title}</div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}
      >
        {badge.label}
      </span>
    </div>
  );
}

function ArrowNortheast() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
