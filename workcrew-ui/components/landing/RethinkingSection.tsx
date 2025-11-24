"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GlassPill from "../primitives/tags/GlassPill";
import LayeredPill, { ArrowNortheastIcon } from "../primitives/buttons/LayeredPill";
import T from "../primitives/Typography";
import { CandidateAuth } from "../../lib/endpoints";

type Feature = {
  id: string;
  title: string;
  blurb: string;
  videoSrc?: string;
  posterSrc?: string;
};

/* recruiter defaults — videos live here */
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

/* candidate defaults */
const CANDIDATE_FEATURES: Feature[] = [
  {
    id: "profile",
    title: "Profile optimisation",
    blurb: "Get AI tips to improve your profile and attract top recruiters.",
  },
  {
    id: "quickapply",
    title: "One click applications",
    blurb: "Apply to jobs instantly with pre-filled details, no extra forms.",
  },
  {
    id: "interview",
    title: "Interview and showcase skills",
    blurb: "Share your strengths through AI-led interviews and assessments.",
  },
  {
    id: "tracking",
    title: "Application tracking",
    blurb: "Track every application with real-time status updates.",
  },
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
  const router = useRouter();

  const [mode, setMode] = useState<"recruiter" | "candidate">("recruiter");
  const isRecruiter = mode === "recruiter";
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const [activeRecruiter, setActiveRecruiter] = useState(0);
  const [activeCandidate, setActiveCandidate] = useState(0);

  // auth state: only need to know if candidate is logged in
  const [isCandidateLoggedIn, setIsCandidateLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkCandidateAuth() {
      try {
        await CandidateAuth.me();
        if (!cancelled) setIsCandidateLoggedIn(true);
      } catch {
        if (!cancelled) setIsCandidateLoggedIn(false);
      }
    }

    checkCandidateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // in candidate mode only the "profile" card borrows the first recruiter video
  const candidateFeaturesWithVideo = useMemo(() => {
    const recruiterProfile =
      features.find((f) => f.id === "jds") ?? DEFAULT_RECRUITER_FEATURES[0];

    return CANDIDATE_FEATURES.map((cf) => ({
      ...cf,
      videoSrc: cf.id === "profile" ? recruiterProfile?.videoSrc : undefined,
      posterSrc: cf.id === "profile" ? recruiterProfile?.posterSrc : undefined,
    }));
  }, [features]);

  const featuresToShow = isRecruiter ? features : candidateFeaturesWithVideo;
  const activeIndex = isRecruiter ? activeRecruiter : activeCandidate;
  const activeFeature = useMemo(
    () => featuresToShow[activeIndex],
    [featuresToShow, activeIndex]
  );

  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const inViewRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
        manageInterval();
      },
      { threshold: 0.35 }
    );
    obs.observe(sectionRef.current);
    return () => {
      obs.disconnect();
      clearOnlyTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    manageInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayEnabled, mode, features.length]);

  const clearOnlyTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearAutoPlay = () => {
    clearOnlyTimer();
    setAutoPlayEnabled(false);
  };

  const manageInterval = () => {
    clearOnlyTimer();
    if (!inViewRef.current || !autoPlayEnabled) return;
    const len =
      modeRef.current === "recruiter"
        ? features.length
        : CANDIDATE_FEATURES.length;
    intervalRef.current = window.setInterval(() => {
      if (modeRef.current === "recruiter") {
        setActiveRecruiter((p) => (p + 1) % len);
      } else {
        setActiveCandidate((p) => (p + 1) % len);
      }
    }, 2000);
  };

  const setActive = (i: number) => {
    clearAutoPlay();
    if (isRecruiter) setActiveRecruiter(i);
    else setActiveCandidate(i);
  };

  const switchMode = (m: "recruiter" | "candidate") => {
    clearOnlyTimer();
    setMode(m);
    setAutoPlayEnabled(true);
  };

  const handleMouseEnter = () => clearAutoPlay();
  const handleMouseLeave = () => {
    setAutoPlayEnabled(true);
    manageInterval();
  };

  // Primary CTA behavior (Hire now / Find work)
  const handlePrimaryCtaClick = () => {
    // keep external callback if someone passed one
    if (onHireNow) {
      onHireNow();
    }

    if (isRecruiter) {
      // recruiter view: always go to recruiter/employer login
      router.push("/login?role=recruiter");
      return;
    }

    // candidate view
    if (isCandidateLoggedIn) {
      router.push("/find-jobs");
    } else {
      router.push("/login?role=candidate");
    }
  };

  return (
    <section
      ref={sectionRef as any}
      id="rethinking"
      className={`relative !my-0 !py-0 ${className}`}
    >
      <div className="py-8 md:py-10">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="md:ml-[60px] max-w-[1094px]">
            <div className="flex items-center">
              <GlassPill text="We’re here for a reason" iconColor="#2288FE" />
            </div>
            <T
              as="h2"
              id={`${groupId}-label`}
              variant="hero48"
              weight={500}
              className="text-left text-black md:text-[48px] text-[40px]"
              autoLeading
            >
              <span className="text-[#4D31EC]">Rethinking</span> how you hire
              and get hired
            </T>
            <T
              as="p"
              variant="body18"
              weight={400}
              trackingPct={3}
              className="mt-2 text-left text-[#111827] md:text-[20px]"
              lineHeightPx={27}
            >
              Build your dream team or find your next move with WorkCrew.ai, all
              in one place, without clutter or chaos.
            </T>
          </div>

          <div
            className="mx-auto mt-5 w-full max-w-[1000px] rounded-[16px] bg-gradient-to-b from-[#F6F7FF] to-white p-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="grid min-h-[420px] md:minh-[460px] grid-cols-1 gap-6 md:grid-cols-2 items-center">
              {/* LEFT SIDE: feature list */}
              <div
                role="tablist"
                aria-labelledby={`${groupId}-label`}
                className="relative z-10 flex h-full min-w-0 flex-col rounded-2xl bg-white/40 p-3 backdrop-blur"
              >
                <ul className="flex-1 overflow-auto pr-2 space-y-3">
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
                            "w-full rounded-2xl border px-5 py-4 text-left transition",
                            selected
                              ? "border-[#4D31EC] bg-white"
                              : "border-[#D9D7FD] bg-[#F3F2FF]/50 hover:bg-white/80",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D31EC]/60",
                          ].join(" ")}
                        >
                          <T
                            as="div"
                            variant="body16"
                            className="text-gray-900 md:text-[17px]"
                            weight={600}
                          >
                            {f.title}
                          </T>
                          {selected && (
                            <T
                              as="div"
                              variant="sub14"
                              className="mt-2 text-gray-700"
                              lineHeightPx={24}
                            >
                              {f.blurb}
                            </T>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  <li className="h-2 md:h-3" aria-hidden />
                </ul>

                {/* footer with CTA and mode switch */}
                <div className="mt-3 border-t border-white/50 pt-3">
                  <LayeredPill
                    label={isRecruiter ? "Hire now" : "Find work"}
                    icon={<ArrowNortheastIcon />}
                    onClick={handlePrimaryCtaClick}
                    size="md"
                  />
                  <div className="mt-3">
                    <T as="span" variant="sub14" className="text-black">
                      I’m a{" "}
                    </T>
                    <button
                      className="no-underline decoration-transparent hover:no-underline focus:no-underline active:no-underline"
                      onClick={() =>
                        switchMode(isRecruiter ? "candidate" : "recruiter")
                      }
                    >
                      <T
                        as="span"
                        variant="body16"
                        weight={500}
                        className="text-[#4D31EC]"
                        autoLeading
                      >
                        {isRecruiter ? "candidate!" : "recruiter"}
                      </T>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: video or candidate placeholder */}
              <div
                role="tabpanel"
                id={`${groupId}-panel`}
                aria-labelledby={`${groupId}-tab-${activeIndex}`}
                aria-live="polite"
                className="flex items-center justify-center justify-self-center"
              >
                <div className="relative h-[300px] w-[300px] md:h-[320px] md:w-[340px] overflow-hidden rounded-[12px] bg-white -translate-y-[50px]">
                  {activeFeature?.videoSrc ? (
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
                    <CandidatePreview id={activeFeature?.id} />
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

/* Candidate placeholder when we don't have a video */
function CandidatePreview({ id }: { id?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <T as="span" variant="sub14" className="text-gray-500">
        Candidate view: {id}
      </T>
    </div>
  );
}
