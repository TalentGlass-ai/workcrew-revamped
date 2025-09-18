"use client";

import * as React from "react";
import Image from "next/image";

type LogoItem = { src: string; alt: string };

type Props = {
  /** seconds per full loop */
  speed?: number;
  /** caption above the strip (optional) */
  caption?: string;
  /** override logos if needed */
  logos?: LogoItem[];
  /** pixel height for each rendered logo (bigger by default) */
  height?: number;
  /** how many times to repeat the 3 logos before doubling for a seamless loop */
  repeat?: number;
};

const BASE_LOGOS: LogoItem[] = [
  { src: "/brands/company1.png", alt: "Company 1" },
  { src: "/brands/company2.png", alt: "Company 2" },
  { src: "/brands/company3.png", alt: "Company 3" },
];

export default function LogoMarquee({
  speed = 24,
  caption = "- Loved by startups, scale-ups, and hiring platforms -",
  logos = BASE_LOGOS,
  height = 44,      // ⬅️ bigger by default
  repeat = 24,      // ⬅️ make a long train that fills wide screens
}: Props) {
  // Build a long list (logos × repeat), then duplicate for seamless loop.
  const longList = React.useMemo(
    () => Array.from({ length: repeat }, (_, i) => logos[i % logos.length]),
    [logos, repeat]
  );
  const doubled = React.useMemo(() => [...longList, ...longList], [longList]);

  return (
    <section className="w-full">
      {/* Caption */}
      <div className="mb-5 flex items-center justify-center">
        <span className="h-px w-32 bg-black/40" />
        <p className="mx-4 text-center text-[14px] font-medium tracking-[0.01em] text-[#A2A2A2]">
          {caption}
        </p>
        <span className="h-px w-32 bg-black/40" />
      </div>

      {/* Transparent marquee (full width, zero gap) */}
      <div className="relative w-full overflow-hidden">
        <div
          className="marquee-track"
          style={{ ["--speed" as any]: `${speed}s`, ["--h" as any]: `${height}px` }}
        >
          {doubled.map((logo, i) => (
            <Image
              key={`${logo.src}-${i}`}
              src={logo.src}
              alt={logo.alt}
              width={0}
              height={0}
              sizes="100vw"
              className="block select-none"
              style={{ height: "var(--h)", width: "auto" }} // natural width, fixed height
              priority={i < 6}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          gap: 0;                 /* zero space between logos */
          align-items: center;
          min-width: max-content; /* track is as wide as all images combined */
          will-change: transform;
          animation: marquee var(--speed) linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); } /* half, because we duplicated */
        }
      `}</style>
    </section>
  );
}
