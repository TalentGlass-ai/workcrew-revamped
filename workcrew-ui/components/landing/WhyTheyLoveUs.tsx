"use client";

import * as React from "react";
import { useId, useState, useMemo } from "react";

type Feature = {
  id: string;
  title: string;
  blurb: string;
  videoSrc?: string;   // if absent, we show a placeholder
  posterSrc?: string;  // optional poster for the video/placeholder
};

type Props = {
  heading?: string;
  subheading?: string;
  features?: Feature[];
  onHireNow?: () => void;
  className?: string;
};

const DEFAULT_FEATURES: Feature[] = [
  {
    id: "jds",
    title: "Post roles in minutes with AI generated JDs",
    blurb: "Generate optimized job descriptions instantly with AI.",
    videoSrc: "/videos/ai-jd-demo.mp4",
    posterSrc: "/videos/poster-ai-jd.jpg",
  },
  {
    id: "screen",
    title: "Screen for quality",
    blurb: "Quality screening filters candidates, showing the best qualified.",
    videoSrc: "/videos/screening-demo.mp4",
    posterSrc: "/videos/poster-screening.jpg",
  },
  {
    id: "assess",
    title: "View assessment backed profiles",
    blurb: "Explore profiles supported by our comprehensive skill assessments.",
    videoSrc: "/videos/assessments-demo.mp4",
    posterSrc: "/videos/poster-assessments.jpg",
  },
  {
    id: "match",
    title: "Real time candidate matching",
    blurb: "Get the top candidate matches when you post a job.",
    videoSrc: "/videos/matching-demo.mp4",
    posterSrc: "/videos/poster-matching.jpg",
  },
];

export default function WhyTheyLoveUs({
  heading = "If you're a recruiter:",
  subheading,
  features = DEFAULT_FEATURES,
  onHireNow,
  className = "",
}: Props) {
  const groupId = useId();
  const [active, setActive] = useState(0);

  const activeFeature = useMemo(() => features[active], [features, active]);

  return (
    <section id="why-love-us" className={`py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[#D8E0FF] bg-white px-3 py-1 text-xs text-[#5E6AD9]"
            aria-label="We're here for a reason"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#5E6AD9]" />
            We’re here for a reason
          </span>
        </div>

        {/* Headline */}
        <h2 className="mx-auto mb-10 max-w-4xl text-center text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          <span className="text-[#5E6AD9]">Rethinking</span>{" "}
          how you hire and get hired
        </h2>

        {subheading ? (
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-600">
            {subheading}
          </p>
        ) : (
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-600">
            Build your dream team or find your next move with WorkCrew.ai, all
            in one place, without clutter or chaos.
          </p>
        )}

        {/* Card grid */}
        <div className="rounded-3xl bg-gradient-to-b from-[#F6F7FF] to-white p-3 sm:p-4">
          {/* isolate creates its own stacking context */}
          <div className="grid gap-6 md:grid-cols-2 isolate">
            {/* LEFT: interactive list (tabs) */}
            <div
              role="tablist"
              aria-labelledby={`${groupId}-label`}
              className="relative z-10 min-w-0 rounded-2xl bg-white/40 p-2 backdrop-blur"
            >
              <p id={`${groupId}-label`} className="sr-only">
                {heading}
              </p>

              <ul className="space-y-3">
                {features.map((f, i) => {
                  const selected = i === active;
                  return (
                    <li key={f.id}>
                      <button
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`${groupId}-panel`}
                        id={`${groupId}-tab-${i}`}
                        onClick={() => setActive(i)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown")
                            setActive((i + 1) % features.length);
                          if (e.key === "ArrowUp")
                            setActive((i - 1 + features.length) % features.length);
                        }}
                        className={[
                          "w-full rounded-2xl border text-left transition",
                          selected
                            ? "border-[#5E6AD9] bg-white shadow-sm"
                            : "border-transparent bg-[#F3F2FF]/50 hover:bg-white/80",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD9]/60",
                          "px-5 py-5"
                        ].join(" ")}
                      >
                        <div className="text-[17px] font-semibold text-gray-900">
                          {f.title}
                        </div>
                        <div
                          className={[
                            "mt-2 text-[15px] leading-6",
                            selected ? "text-gray-700" : "text-gray-600"
                          ].join(" ")}
                        >
                          {f.blurb}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Hire now button */}
              <div className="mt-6">
                <HireNowButton onClick={onHireNow} />
                <div className="mt-3 text-sm text-gray-600">
                  I’m a{" "}
                  <a className="text-[#5E6AD9] underline" href="#candidate">
                    candidate!
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT: video demo panel */}
            {/* Make the whole column ignore pointer events to avoid overlap blocking */}
            <div
              role="tabpanel"
              id={`${groupId}-panel`}
              aria-labelledby={`${groupId}-tab-${active}`}
              className="relative z-0 min-w-0 rounded-2xl bg-white p-4 shadow-sm pointer-events-none"
            >
              <div className="rounded-xl border bg-[#F7FAFF] p-3">
                <div className="mb-3 inline-flex rounded-md bg-[#EAF7E9] px-3 py-1 text-sm font-medium text-[#2F7D32]">
                  {labelFor(activeFeature.id)}
                </div>

                {/* Re-enable pointer events ONLY for the actual media box (if you ever need it) */}
                <div className="overflow-hidden rounded-xl border bg-white pointer-events-auto">
                  {activeFeature.videoSrc ? (
                    <video
                      key={activeFeature.videoSrc}
                      className="h-[340px] w-full object-cover md:h-[420px]"
                      src={activeFeature.videoSrc}
                      poster={activeFeature.posterSrc}
                      muted
                      playsInline
                      loop
                      autoPlay
                      controls={false}
                    />
                  ) : (
                    <PlaceholderPanel
                      title="Demo video coming soon"
                      subtitle="We’ll swap this with your real feature demo."
                      poster={activeFeature.posterSrc}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helpers ---------- */

function labelFor(id: string) {
  switch (id) {
    case "jds":
      return "Job requirements";
    case "screen":
      return "Screening";
    case "assess":
      return "Assessment – React developer";
    case "match":
      return "Candidates";
    default:
      return "Preview";
  }
}

function PlaceholderPanel({
  title,
  subtitle,
  poster,
}: {
  title: string;
  subtitle?: string;
  poster?: string;
}) {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center md:h-[420px]">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70 pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#f7f7ff,#f7f7ff_10px,#f0f0ff_10px,#f0f0ff_20px)] pointer-events-none" />
      )}
      <div className="relative z-10 rounded-xl bg-white/85 px-4 py-3 text-center shadow">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Pill button like your screenshot */
function HireNowButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold",
        "text-white",
        "bg-[#5E6AD9]",
        "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[#5E6AD9]/20 before:blur-xl",
        "hover:bg-[#4e5ed1] active:scale-[0.99] transition"
      ].join(" ")}
    >
      <span>Hire now</span>
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
      </svg>
    </button>
  );
}
