"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

/* ------------------------- Types ------------------------- */
type Feature = {
  id: string;
  title: string;
  blurb: string;
  videoSrc?: string;
  posterSrc?: string;
};

/* ------------------ Default Recruiter Features ------------------ */
const DEFAULT_RECRUITER_FEATURES: Feature[] = [
  {
    id: "jds",
    title: "Post roles in minutes with AI generated JDs",
    blurb: "Generate optimized job descriptions instantly with AI.",
    videoSrc: "/videos/JD.mp4",
  },
  {
    id: "screen",
    title: "Screen for quality",
    blurb: "Quality screening filters candidates, showing the best qualified.",
    videoSrc: "/videos/Screening.mp4",
  },
  {
    id: "assess",
    title: "View assessment backed profiles",
    blurb: "Explore profiles supported by our comprehensive skill assessments.",
    videoSrc: "/videos/Assessment insights.mp4",
  },
  {
    id: "match",
    title: "Real time candidate matching",
    blurb: "Get the top candidate matches when you post a job.",
    videoSrc: "/videos/candidate matching.mp4",
  },
];

/* ------------------ Candidate Features ------------------ */
const CANDIDATE_FEATURES: Feature[] = [
  { id: "profile",    title: "Profile optimisation",           blurb: "Get AI tips to improve your profile and attract top recruiters." },
  { id: "quickapply", title: "One click applications",         blurb: "Apply to jobs instantly with pre-filled details, no extra forms." },
  { id: "interview",  title: "Interview and showcase skills",  blurb: "Share your strengths through AI-led interviews and assessments." },
  { id: "tracking",   title: "Application tracking",           blurb: "Track every application with real-time status updates." },
];

/* ================= Rethinking Section ================= */
export default function RethinkingSection({
  features = DEFAULT_RECRUITER_FEATURES,
  onHireNow,
  className = "",
}: {
  features?: Feature[];
  onHireNow?: () => void;
  className?: string;
}) {
  const groupId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);

  const [mode, setMode] = useState<"recruiter" | "candidate">("recruiter");
  const isRecruiter = mode === "recruiter";
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const [activeRecruiter, setActiveRecruiter] = useState(0);
  const [activeCandidate, setActiveCandidate] = useState(0);

  const featuresToShow = isRecruiter ? features : CANDIDATE_FEATURES;
  const activeIndex = isRecruiter ? activeRecruiter : activeCandidate;

  const activeFeature = useMemo(
    () => featuresToShow[activeIndex],
    [featuresToShow, activeIndex]
  );

  /* ---------------- Autoplay ---------------- */
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const inViewRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0].isIntersecting;
        manageInterval();
      },
      { threshold: 0.35 }
    );
    obs.observe(sectionRef.current);
    return () => {
      obs.disconnect();
      clearAutoPlay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { manageInterval(); }, [autoPlayEnabled, features.length]); // eslint-disable-line

  const manageInterval = () => {
    clearAutoPlay();
    if (!inViewRef.current || !autoPlayEnabled) return;
    intervalRef.current = window.setInterval(() => {
      if (modeRef.current === "recruiter") {
        setActiveRecruiter((p) => (p + 1) % features.length);
      } else {
        setActiveCandidate((p) => (p + 1) % CANDIDATE_FEATURES.length);
      }
    }, 2000);
  };

  const clearAutoPlay = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoPlayEnabled(false);
  };

  const setActive = (i: number) => {
    clearAutoPlay(); // stop autoplay on interaction
    if (isRecruiter) setActiveRecruiter(i);
    else setActiveCandidate(i);
  };

  const switchMode = (m: "recruiter" | "candidate") => {
    clearAutoPlay();
    setMode(m);
  };

  return (
    <section ref={sectionRef as any} id="rethinking" className={`py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-[1400px] px-0">
        {/* ===================== Header ===================== */}
        <div
          className="flex flex-col justify-start"
          style={{ width: "1094px", height: "162px", marginLeft: "93px" }}
        >
          {/* Pill with capsule background */}
          <div
            className="flex items-center whitespace-nowrap"
            style={{
              width: "208px",
              height: "38px",
              borderRadius: "9999px",
              backgroundColor: "rgba(195, 215, 255, 0.32)", // C3D7FF @ 32%
              border: "1px solid #C3D7FF",
              paddingLeft: "10px",
              paddingRight: "14px",
            }}
          >
            {/* Solid bolt icon, 1.5× taller */}
            <svg
              width="15"
              height="27"
              viewBox="0 0 24 24"
              fill="#4D31EC"
              stroke="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h7v8l11-14h-7V2z" />
            </svg>

            {/* Text */}
            <span
              style={{
                fontFamily: "Archivo, var(--font-sans)",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "0.03em",
                lineHeight: "normal",
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              We’re here for a reason
            </span>
          </div>

          {/* Heading */}
          <h2
            className="mt-4 text-left"
            style={{
              fontFamily: "Schibsted Grotesk, var(--font-display)",
              fontWeight: 500,
              fontSize: "48px",
              letterSpacing: "0.01em",
              lineHeight: "normal",
            }}
          >
            <span className="text-[#4D31EC]">Rethinking</span>{" "}
            <span className="text-black">how you hire and get hired</span>
          </h2>

          {/* Tagline */}
          <p
            className="mt-2 text-left"
            style={{
              fontFamily: "Archivo, var(--font-sans)",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "27px",
              letterSpacing: "0.03em",
              color: "#111827",
            }}
          >
            Build your dream team or find your next move with WorkCrew.ai, all in one place,
            without clutter or chaos.
          </p>
        </div>

        {/* ===================== Outer Panel ===================== */}
        <div className="mx-auto mt-6 w-[1100px] h-[632px] rounded-[16px] bg-gradient-to-b from-[#F6F7FF] to-white p-4">
          <div className="grid h-full grid-cols-2 gap-6">
            {/* LEFT: tabs */}
            <div
              role="tablist"
              aria-labelledby={`${groupId}-label`}
              className="relative z-10 min-w-0 rounded-2xl bg-white/40 p-3 backdrop-blur"
            >
              <ul className="space-y-3">
                {featuresToShow.map((f, i) => {
                  const selected = i === activeIndex;
                  return (
                    <li key={f.id}>
                      <button
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`${groupId}-panel`}
                        id={`${groupId}-tab-${i}`}
                        onClick={() => setActive(i)}
                        className={[
                          "w-full rounded-2xl border text-left transition px-5 py-5",
                          selected
                            ? "border-[#4D31EC] bg-white shadow-sm"
                            : "border-[#D9D7FD] bg-[#F3F2FF]/50 hover:bg-white/80",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D31EC]/60",
                        ].join(" ")}
                      >
                        <div className="text-[17px] font-semibold text-gray-900">{f.title}</div>
                        {selected && (
                          <div className="mt-2 text-[15px] leading-6 text-gray-700">{f.blurb}</div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* CTA + toggle */}
              <div className="mt-6">
                <HireNowButton onClick={onHireNow} />
                <div className="mt-3 text-sm text-gray-600">
                  I’m a{" "}
                  <button
                    className="text-[#5E6AD9] underline"
                    onClick={() => switchMode(isRecruiter ? "candidate" : "recruiter")}
                  >
                    {isRecruiter ? "candidate!" : "recruiter"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: video box */}
            <div
              role="tabpanel"
              id={`${groupId}-panel`}
              aria-labelledby={`${groupId}-tab-${activeIndex}`}
              className="flex items-start justify-center"
            >
              <div className="rounded-[12px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-[#E9ECF6]">
                {/* removed the heading/label above video */}

                <div
                  className="relative overflow-hidden rounded-[10px] ring-1 ring-[#EEF1FF]"
                  style={{ width: 368, height: 371, background: "#D9D9D9" }}
                >
                  {isRecruiter && activeFeature.videoSrc ? (
                    <video
                      key={activeFeature.videoSrc}
                      className="absolute inset-0 h-full w-full object-cover"
                      src={encodeURI(activeFeature.videoSrc)}
                      poster={activeFeature.posterSrc}
                      muted
                      playsInline
                      loop
                      autoPlay
                      controls={false}
                    />
                  ) : (
                    <CandidatePreview id={activeFeature.id} />
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

function CandidatePreview({ id }: { id: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-500">
      Candidate view: {id}
    </div>
  );
}

/* ---------------------------- Hire Now button ---------------------------- */
/** 3-layer capsule with synchronized hover lift (matches screenshot style) */
function HireNowButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Hire now"
      className="group relative inline-block focus:outline-none"
    >
      {/* Outer pill: C4D3EF @ 43% with soft shadow */}
      <span
        className="block h-[67px] w-[200px] rounded-[9999px] transition-transform group-hover:-translate-y-[1px]"
        style={{
          backgroundColor: "rgba(196, 211, 239, 0.43)", // #C4D3EF @ 43%
          boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
        }}
      />

      {/* Middle pill: E7E3FF @ 100% with subtle inner highlight */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span
          className="block h-[59px] w-[190px] rounded-[9999px] bg-[#E7E3FF] transition-transform group-hover:-translate-y-[1px]"
          style={{
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.60)",
          }}
        />
      </span>

      {/* Inner pill: 4D31EC @ 100% with text + arrow */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-[9999px] bg-[#4D31EC] text-[15px] font-semibold text-white transition-transform group-hover:-translate-y-[1px] shadow-md">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
          </svg>
          <span>Hire now</span>
        </span>
      </span>
    </button>
  );
}
