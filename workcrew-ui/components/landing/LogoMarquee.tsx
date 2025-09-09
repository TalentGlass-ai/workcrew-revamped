"use client";

import * as React from "react";
import Logo from "../landing/Logo"; // ✅ import your reusable Logo component

type LogoItem = { src: string; alt: string; width?: number; height?: number };

type Props = {
  speed?: number;           // seconds per full loop
  logos?: LogoItem[];
  caption?: string;
  className?: string;
};

const DEFAULT_LOGOS: LogoItem[] = [
  { src: "/brands/company1.png", alt: "Azul",   width: 96, height: 28 },
  { src: "/brands/company2.png", alt: "Linmac", width: 96, height: 28 },
  { src: "/brands/company3.png", alt: "Campus", width: 96, height: 28 },
];

export default function LogoMarquee({
  speed = 24,
  logos = DEFAULT_LOGOS,
  caption = "Loved by startups, scale-ups, and hiring platforms",
  className,
}: Props) {
  // duplicate once for seamless loop
  const strip = React.useMemo(() => [...logos, ...logos], [logos]);

  return (
    <div className={["relative w-full bg-white", className].filter(Boolean).join(" ")}>
      {/* Figma bar: 97px high with thin borders */}
      <div className="relative h-[97px] border-y border-neutral-200/70 overflow-hidden">
        {/* centered caption */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-[11px] md:text-xs font-medium text-neutral-400">
            {caption}
          </p>
        </div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />

        {/* moving logos under the caption */}
        <div
          className="absolute inset-0 flex items-center gap-12 will-change-transform hover:[animation-play-state:paused] wc-marquee"
          style={{ animationDuration: `${speed}s`, minWidth: "120%" }}
          aria-label="Company logos"
        >
          {strip.map((l, i) => (
            <div
              key={`${l.src}-${i}`}
              className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
            >
              <Logo
                src={l.src}
                alt={l.alt}
                width={l.width ?? 96}
                height={l.height ?? 28}
              />
            </div>
          ))}
        </div>
      </div>

      {/* keyframes + reduced motion */}
      <style jsx>{`
        .wc-marquee {
          animation-name: wc-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes wc-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wc-marquee {
            animation-duration: 0.001ms;
            animation-iteration-count: 1;
          }
        }
      `}</style>
    </div>
  );
}
