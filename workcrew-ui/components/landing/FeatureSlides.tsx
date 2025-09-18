"use client";

import * as React from "react";

/** Slide shape */
export type FeatureSlide = {
  id?: string;
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

export default function FeatureSlides({ slides = SLIDES_DEFAULT, className = "" }: Props) {
  const [i, setI] = React.useState(0);
  const go = (d: number) => setI((p) => (p + d + slides.length) % slides.length);
  const s = slides[i];

  return (
    <section className={`mx-auto mt-12 w-full max-w-[1003px] px-4 ${className}`}>
      {/* Title + copy (Figma spec) */}
      <div className="mx-auto max-w-[918px]">
        <h3 className="how-title">
          Here’s <span style={{ color: "#4D31EC" }}>how</span> we do it!
        </h3>
        <p className="how-subtitle mt-3">
          We provide clarity, efficiency, and intelligence at every stage of the hiring process.
          Whether you are changing careers or expanding your team, we make each step simpler.
        </p>
      </div>

      {/* Purple card with gradient border */}
      <div className="relative mx-auto mt-8 w-full">
        {/* gradient border wrapper (1px) */}
        <div
          className="rounded-[10px] p-[1px]"
          style={{
            background:
              "linear-gradient(159.15deg, #FFFFFF 20.18%, rgba(195,191,255,0.11) 247.36%)",
          }}
        >
          {/* inner purple surface */}
          <div className="grid min-h-[581px] w-full grid-cols-1 rounded-[9px] bg-[#4D31EC] p-6 md:grid-cols-2 md:p-10">
            {/* LEFT: text only */}
            <div className="flex flex-col justify-center text-white">
              <FeatureIcon index={i} />

              <h4 className="mb-3 text-[28px] font-semibold leading-tight">
                {s.title}
              </h4>
              <p className="max-w-[480px] text-[14px] leading-6 text-white/90">
                {s.copy}
              </p>
            </div>

            {/* RIGHT: visual + CTA below the visual */}
            <div className="mt-8 flex flex-col items-center justify-center gap-6 md:mt-0">
              {/* Illustration “card” (458×324) */}
              <Illustration index={i} />

              {/* CTA lives BELOW the image */}
              <CtaElliptical href={s.ctaHref ?? "#"} label={s.ctaLabel ?? "Try it out"} />
            </div>
          </div>
        </div>

        {/* prev / next */}
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="absolute left-[-18px] top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-black/5 hover:bg-white md:left-[-28px]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="absolute right-[-18px] top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-black/5 hover:bg-white md:right-[-28px]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6"/></svg>
        </button>

        {/* dots */}
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition ${idx===i ? "w-8 bg-[#4D31EC]" : "w-3 bg-slate-300"}`}
              aria-label={`Go to slide ${idx+1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Elliptical CTA — 3 layers with a visible ring */
        .cta-outer {
          width: 169px;
          height: 67px;
          border-radius: 30px;
          background: #C4D3EF6E;   /* outer ellipse */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px;            /* centers the middle ellipse */
          box-shadow: 0 12px 32px rgba(0,0,0,0.10);
        }
        .cta-middle {
          width: 149px;
          height: 50px;
          border-radius: 30px;
          background: #E7E3FF;     /* middle ellipse */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;            /* <-- creates a visible ring around the inner pill */
        }
        .cta-inner {
          width: 100%;
          height: 100%;
          border-radius: 26px;     /* slightly smaller so corners look right inside the ring */
          background: #FFFFFF;     /* inner ellipse */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;

          /* Label typography */
          font-family: var(--font-sans);  /* Archivo */
          font-weight: 600;               /* SemiBold */
          font-size: 16px;
          line-height: 1;
          letter-spacing: 0.02em;         /* 2% */
          color: #4D31EC;
        }
        .cta-inner:hover { filter: brightness(0.98); }
      `}</style>
    </section>
  );
}

/* ---------- tiny pieces ---------- */

function CtaElliptical({ href, label }: { href: string; label: string }) {
  return (
    <div className="cta-outer">
      <div className="cta-middle">
        <a className="cta-inner" href={href} aria-label={label}>
          <ArrowNortheast />
          {label}
        </a>
      </div>
    </div>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const common = "opacity-90";
  const stroke = "currentColor";
  const size = 24;

  return (
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
      {index === 0 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8M16 17H8M10 9H8"/>
        </svg>
      )}
      {index === 1 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M3 7h18M6 7l1 12h10l1-12M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      )}
      {index === 2 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M8 10h8M8 14h6"/>
        </svg>
      )}
      {index === 3 && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <circle cx="12" cy="7" r="3"/>
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
        </svg>
      )}
    </div>
  );
}

function Illustration({ index }: { index: number }) {
  return (
    <div className="w-[458px] max-w-full rounded-[9px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">
          {index === 0 && "Resume Parser"}
          {index === 1 && "Job matches"}
          {index === 2 && "AI Assessments"}
          {index === 3 && "Scheduled interviews"}
        </div>
        <div className="h-2 w-28 rounded-full bg-slate-200" />
      </div>

      {/* body (varies per slide) */}
      {index === 0 && (
        <div className="flex h-[220px] items-center justify-center rounded-[8px] border-2 border-dashed border-slate-300/90">
          <div className="text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-100" />
            <div className="text-sm font-semibold text-slate-700">Upload Resume</div>
            <div className="text-xs text-slate-500">PDF, DOCX</div>
          </div>
        </div>
      )}

      {index === 1 && (
        <div className="rounded-[8px] border border-slate-200 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-700">AI match algorithm</div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 w-1/5 rounded-full bg-[#4D31EC]" />
          </div>
          <div className="mt-2 text-right text-xs text-slate-500">10%</div>
        </div>
      )}

      {index === 2 && (
        <div className="rounded-[8px] border border-slate-200 p-4">
          <div className="mb-3 h-6 w-36 rounded bg-slate-100" />
          <div className="h-40 rounded bg-slate-50" />
        </div>
      )}

      {index === 3 && (
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
      )}
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
