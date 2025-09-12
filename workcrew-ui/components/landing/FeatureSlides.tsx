"use client";

import Image from "next/image";
import React from "react";
//not done yet have doubts in this section 
type Slide = {
  id: string;
  icon?: React.ReactNode;          // can we swap for an <Image /> ...?
  title: string;
  copy: string;
  videoSrc?: string;               
  imageSrc?: string;               
  ctaHref?: string;
};

type Props = {
  slides: Slide[];
  className?: string;
};

export default function FeatureSlides({ slides, className }: Props) {
  const [index, setIndex] = React.useState(0);

  const total = slides.length;
  const go = (n: number) => setIndex((prev) => (n + total) % total);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // keyboard navigation
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  // simple touch swipe
  const startX = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  const slide = slides[index];

  return (
    <section className={className}>
      {/* Outer container width ~1280, inner panel ~1003×581 on md+ */}
      <div className="mx-auto max-w-[1280px] px-4">
        <div
          className="
            relative mx-auto rounded-xl border
            border-white/10
            bg-[#4D31EC] text-white shadow-[0_30px_120px_rgba(77,49,236,0.25)]
            md:rounded-[10px]
            md:w-[1003px] md:h-[581px]
          "
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* content grid */}
          <div className="grid h-full grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-10">
            {/* LEFT copy */}
            <div className="flex flex-col justify-center">
              <div className="mb-5 text-2xl/none opacity-90">
                {/* icon (use emoji or replace with <Image />) */}
                <span aria-hidden>🗂️</span>
              </div>

              <h3 className="mb-2 text-xl font-semibold md:text-2xl">{slide.title}</h3>

              <p className="max-w-[420px] text-sm leading-6 text-white/85">
                {slide.copy}
              </p>

              <div className="mt-8">
                <a
                  href={slide.ctaHref || "#"}
                  className="
                    inline-flex h-[67px] w-[169px] items-center justify-center gap-2
                    rounded-[30px] bg-white text-[#4D31EC] font-semibold
                    ring-1 ring-white/70 shadow-[0_12px_40px_rgba(88,87,255,0.45)]
                    hover:brightness-95 transition
                  "
                >
                  <ArrowNortheast />
                  <span>Try it out</span>
                </a>
              </div>
            </div>

            {/* RIGHT media 458×324, radius 9px */}
            <div className="flex items-center justify-center">
              <div className="rounded-[9px] border border-white/30 bg-white/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                <div className="rounded-[9px] border border-black/5 bg-white p-3">
                  <div className="overflow-hidden rounded-[9px] md:w-[458px] md:h-[324px]">
                    {slide.videoSrc ? (
                      <video
                        src={slide.videoSrc}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : slide.imageSrc ? (
                      <Image
                        src={slide.imageSrc}
                        alt={slide.title}
                        width={458}
                        height={324}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
                        458×324
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* left/right arrows */}
          <button
            aria-label="Previous"
            onClick={prev}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              grid size-9 place-items-center rounded-full
              bg-white/90 text-[#4D31EC] shadow hover:bg-white
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              grid size-9 place-items-center rounded-full
              bg-white/90 text-[#4D31EC] shadow hover:bg-white
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* dots */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "inline-block h-2 w-2 rounded-full bg-white/60",
                    i === index ? "w-6 bg-white" : "",
                  ].join(" ")}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>

        {/* little scrubber line under the panel like Figma... */}
        <div className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-[#3FB7FF]" />
      </div>

      <div className="mt-2 text-center text-xs text-slate-500">• • •</div>
    </section>
  );
}

/* ---------- tiny icon ---------- */
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
