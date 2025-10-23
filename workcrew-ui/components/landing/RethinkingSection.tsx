"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import GlassPill from "../primitives/tags/GlassPill";
import LayeredPill, { ArrowNortheastIcon } from "../primitives/buttons/LayeredPill";

type Feature = {
  id: string;
  title: string;
  blurb: string;
  videoSrc?: string;
  posterSrc?: string;
};

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

/* Candidate-side feature list */
const CANDIDATE_FEATURES: Feature[] = [
  { id: "profile", title: "Profile optimisation", blurb: "Get AI tips to improve your profile and attract top recruiters." },
  { id: "quickapply", title: "One click applications", blurb: "Apply to jobs instantly with pre-filled details, no extra forms." },
  { id: "interview", title: "Interview and showcase skills", blurb: "Share your strengths through AI-led interviews and assessments." },
  { id: "tracking", title: "Application tracking", blurb: "Track every application with real-time status updates." },
];

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
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const [activeRecruiter, setActiveRecruiter] = useState(0);
  const [activeCandidate, setActiveCandidate] = useState(0);

  const featuresToShow = isRecruiter ? features : CANDIDATE_FEATURES;
  const activeIndex = isRecruiter ? activeRecruiter : activeCandidate;
  const activeFeature = useMemo(() => featuresToShow[activeIndex], [featuresToShow, activeIndex]);

  /* Autoplay changes while in view; pauses on interaction */
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

  useEffect(() => {
    manageInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayEnabled, features.length]);

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
    clearAutoPlay();
    if (isRecruiter) setActiveRecruiter(i);
    else setActiveCandidate(i);
  };

  const switchMode = (m: "recruiter" | "candidate") => {
    clearAutoPlay();
    setMode(m);
  };

  /* Markup */
  return (
    <section ref={sectionRef as any} id="rethinking" className={`py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-[1400px] px-0">
        {/* Header */}
        <div className="ml-[93px] h-[162px] w-[1094px] max-w-full">
          <div className="flex items-center whitespace-nowrap">
            <GlassPill text="We’re here for a reason" iconColor="#2288FE" />
          </div>

          <h2 className="mt-4 text-left font-display text-[48px] font-[500] tracking-[0.01em] leading-[normal]">
            <span className="text-[#4D31EC]">Rethinking</span>{" "}
            <span className="text-black">how you hire and get hired</span>
          </h2>

          <p className="mt-2 text-left font-alt text-[20px] font-[400] leading-[27px] tracking-[0.03em] text-[#111827]">
            Build your dream team or find your next move with WorkCrew.ai, all in one place, without clutter or chaos.
          </p>
        </div>

        {/* Panel: tabs (left) + preview (right) */}
        <div className="mx-auto mt-6 h-[632px] w-[1100px] max-w-full rounded-[16px] bg-gradient-to-b from-[#F6F7FF] to-white p-4">
          <div className="grid h-full grid-cols-2 gap-6">
            {/* Tabs list */}
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
                          "w-full rounded-2xl border px-5 py-5 text-left transition",
                          selected
                            ? "border-[#4D31EC] bg-white"
                            : "border-[#D9D7FD] bg-[#F3F2FF]/50 hover:bg-white/80",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D31EC]/60",
                        ].join(" ")}
                      >
                        <div className="text-[17px] font-semibold text-gray-900">{f.title}</div>
                        {selected && <div className="mt-2 text-[15px] leading-6 text-gray-700">{f.blurb}</div>}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* CTA + mode toggle */}
              <div className="mt-6">
                <LayeredPill label="Hire now" icon={<ArrowNortheastIcon />} onClick={onHireNow} size="md" />
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

            {/* Preview area */}
            <div
              role="tabpanel"
              id={`${groupId}-panel`}
              aria-labelledby={`${groupId}-tab-${activeIndex}`}
              className="flex items-start justify-center"
            >
              <div className="relative h-[371px] w-[368px] overflow-hidden rounded-[12px] bg-[#D9D9D9] ring-1 ring-[#E9ECF6]">
                {isRecruiter && activeFeature.videoSrc ? (
                  <video
                    key={activeFeature.videoSrc}
                    className="absolute inset-0 h-full w-full rounded-[12px] object-cover"
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
    </section>
  );
}

/* Candidate preview placeholder */
function CandidatePreview({ id }: { id: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-gray-500">Candidate view: {id}</div>;
}
