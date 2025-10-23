"use client";

import * as React from "react";

/* Slide shape used by the carousel */
export type FeatureSlide = {
  id?: "resume" | "matching" | "assessments" | "interviews" | string;
  title: string;
  copy: string;
  ctaHref?: string;
  ctaLabel?: string;
};

type Props = {
  slides?: FeatureSlide[];
  className?: string;
};

const SLIDES_DEFAULT: FeatureSlide[] = [
  {
    id: "resume",
    title: "Smart resume parsing",
    copy:
      "AI smartly extracts and organizes your skills, experience, and achievements from any resume format.",
    ctaHref: "#resume-parser",
    ctaLabel: "Try it out",
  },
  {
    id: "matching",
    title: "AI job matching",
    copy:
      "Get matched with jobs that truly fit your skills, experience and career goals. Quality over quantity, always.",
    ctaHref: "#job-matching",
    ctaLabel: "Try it out",
  },
  {
    id: "assessments",
    title: "Structured assessments",
    copy:
      "AI assessments accurately measure your strengths using data-driven, personalized evaluations.",
    ctaHref: "#assessments",
    ctaLabel: "Try it out",
  },
  {
    id: "interviews",
    title: "AI interviews",
    copy:
      "AI interviews simulate real-world questions to evaluate your communication, problem-solving, and role-specific skills.",
    ctaHref: "#ai-interviews",
    ctaLabel: "Try it out",
  },
];

export default function FeatureSlides({
  slides = SLIDES_DEFAULT,
  className = "",
}: Props) {
  const [i, setI] = React.useState(0);
  const go = (d: number) => setI((p) => (p + d + slides.length) % slides.length);
  const s = slides[i];

  return (
    <section className={`relative ${className}`}>
      {/* Full-bleed section with layered background */}
      <div className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden">
        {/* Soft gradient */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(246,247,252,0.95)_0%,rgba(236,239,248,0.92)_100%)]"
        />
        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 opacity-30 bg-[linear-gradient(rgba(163,157,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(163,157,255,0.25)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1003px] px-4 py-12 md:py-16">
          {/* Heading */}
          <div className="mx-auto max-w-[918px]">
            <h3 className="how-title">
              Here’s <span className="text-[#4D31EC]">how</span> we do it!
            </h3>

            {/* Spacer: 35px */}
            <div className="h-[35px]" />

            <p className="how-subtitle">
              We provide clarity, efficiency, and intelligence at every stage of the hiring process.
              Whether you are changing careers or expanding your team, we make each step simpler.
            </p>
          </div>

          {/* Spacer: 15px */}
          <div className="h-[15px]" />

          {/* Arrows + Card */}
          <div className="relative mt-8">
            <div className="grid grid-cols-[auto_1fr_auto] items-center">
              {/* Left Arrow (20px offset) */}
              <NavButton
                ariaLabel="Previous"
                onClick={() => go(-1)}
                direction="left"
                className="mr-[20px] justify-self-end"
              />

              {/* Card with faint gradient border */}
              <div className="rounded-[10px] p-[1px] bg-[linear-gradient(159.15deg,#FFFFFF_20.18%,rgba(195,191,255,0.11)_247.36%)]">
                <div className="grid min-h-[581px] w-full grid-cols-1 rounded-[9px] bg-[#4D31EC] p-6 md:grid-cols-2 md:p-10">
                  {/* LEFT: text */}
                  <div className="flex flex-col justify-center text-white">
                    <FeatureIcon index={i} />
                    <h4 className="mb-3 text-[28px] font-semibold leading-tight">{s.title}</h4>
                    <p className="max-w-[480px] text-[14px] leading-6 text-white/90">{s.copy}</p>
                  </div>

                  {/* RIGHT: media + CTA */}
                  <div className="mt-8 flex flex-col items-center justify-center gap-6 md:mt-0">
                    <Illustration key={s.id} slide={s} />
                    <CtaElliptical href={s.ctaHref ?? "#"} label={s.ctaLabel ?? "Try it out"} />
                  </div>
                </div>
              </div>

              {/* Right Arrow (20px offset) */}
              <NavButton
                ariaLabel="Next"
                onClick={() => go(1)}
                direction="right"
                className="ml-[20px] justify-self-start"
              />
            </div>

            {/* Pagination dots */}
            <div className="mt-4 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition ${
                    idx === i ? "w-8 bg-[#4D31EC]" : "w-3 bg-slate-300"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Arrow button */
function NavButton({
  onClick,
  direction,
  className = "",
  ariaLabel,
}: {
  onClick: () => void;
  direction: "left" | "right";
  className?: string;
  ariaLabel: string;
}) {
  return (
    <button aria-label={ariaLabel} onClick={onClick} className={`p-1 ${className}`}>
      {direction === "left" ? (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4D31EC"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      ) : (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4D31EC"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}

/* CTA: concentric rounded pills (outer → middle → inner link) */
function CtaElliptical({ href, label }: { href: string; label: string }) {
  return (
    <div className="grid h-[67px] w-[169px] place-items-center rounded-full bg-[rgba(196,211,239,0.43)]">
      <div className="grid h-[59px] w-[159px] place-items-center rounded-full bg-[#E7E3FF]">
        <a
          className="no-underline inline-flex h-[50px] w-[149px] items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold leading-[1] tracking-[0.02em] text-[#4D31EC]"
          href={href}
          aria-label={label}
        >
          <ArrowNortheast />
          {label}
        </a>
      </div>
    </div>
  );
}

/* Feature icon that swaps per slide index */
function FeatureIcon({ index }: { index: number }) {
  const common = "opacity-90";
  const stroke = "currentColor";
  const size = 24;

  return (
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
      {index === 0 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
      )}
      {index === 1 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M3 7h18M6 7l1 12h10l1-12M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
      {index === 2 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 10h8M8 14h6" />
        </svg>
      )}
      {index === 3 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <circle cx="12" cy="7" r="3" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      )}
    </div>
  );
}

/* Video with graceful fallback */
function Illustration({ slide }: { slide: FeatureSlide }) {
  const sourcesMap: Record<string, string[]> = {
    resume: ["/videos/resume_parse.mp4"],
    matching: ["/videos/jobmatching.mp4"],
    assessments: [
      "/videos/Assessment%20insights.mp4",
      "/videos/assessment_insights.mp4",
      "/videos/assessment-insights.mp4",
    ],
    interviews: [],
  };

  const sources = sourcesMap[slide.id ?? ""] ?? [];
  const [failed, setFailed] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    setFailed(false);
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
      v.load();
      const p = v.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {}
  }, [slide.id]);

  const hasVideo = sources.length > 0 && !failed;

  if (hasVideo) {
    return (
      <div className="-mt-5 w-[458px] max-w-full overflow-hidden rounded-[9px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
        <video
          key={slide.id}
          ref={videoRef}
          className="h-[260px] w-full rounded-[9px] object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        >
          {sources.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
      </div>
    );
  }

  // Fallback card
  return (
    <div className="w-[458px] max-w-full rounded-[9px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
      <div className="space-y-3 rounded-[8px] border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700">TechCorp</div>
            <div className="text-xs text-slate-500">Senior software engineer | Remote</div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Now</span>
        </div>
        <button className="w-full rounded bg-[#4D31EC] py-2 text-sm font-semibold text-white">
          Join interview
        </button>
        <div className="pt-2">
          <div className="text-sm font-semibold text-slate-700">TechViz</div>
          <div className="text-xs text-slate-500">Backend engineer | Bangalore, India</div>
        </div>
      </div>
    </div>
  );
}

function ArrowNortheast() {
  return (
    <svg
      className="shrink-0"
      width="16"
      height="16"
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
