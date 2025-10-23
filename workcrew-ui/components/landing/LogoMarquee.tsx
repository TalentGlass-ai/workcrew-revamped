"use client";

import * as React from "react";
import Image from "next/image";

type LogoItem = { src: string; alt: string };

type Props = {
  speed?: number;       // seconds for one full pass (controls animation duration)
  caption?: string;
  logos?: LogoItem[];
  heightMax?: number;   // px
  heightMin?: number;   // px
  heightVw?: number;    // vw
  gap?: number;         // px between logo cells
  itemPx?: number;      // px horizontal padding inside each cell
  repeat?: number;      // number of logos before looping
};

const BASE_LOGOS: LogoItem[] = [
  { src: "/brands/company1.png", alt: "Company 1" },
  { src: "/brands/company2.png", alt: "Company 2" },
  { src: "/brands/company3.png", alt: "Company 3" },
];

export default function LogoMarquee({
  speed = 100,
  caption = "- Loved by startups, scale-ups, and hiring platforms -",
  logos,
  heightMax = 128, // increased maximum height
  heightMin = 80,  // taller baseline height
  heightVw = 16,   // scales more with viewport width
  gap = 12,        // slightly more space between logos
  itemPx = 12,     // more inner padding per logo
  repeat = 24,
}: Props) {
  const srcLogos = logos && logos.length > 0 ? logos : BASE_LOGOS;

  // ensure enough logos to avoid empty gaps
  const safeRepeat = React.useMemo(() => {
    if (srcLogos.length < 2) return Math.max(repeat, 64);
    if (srcLogos.length < 4) return Math.max(repeat, 40);
    return repeat;
  }, [srcLogos.length, repeat]);

  // repeat and duplicate for smooth continuous scroll
  const longList = React.useMemo(
    () => Array.from({ length: safeRepeat }, (_, i) => srcLogos[i % srcLogos.length]),
    [srcLogos, safeRepeat]
  );
  const doubled = React.useMemo(() => [...longList, ...longList], [longList]);

  // build responsive Tailwind classes dynamically
  const trackHeight = `min-h-[clamp(${heightMin}px,${heightVw}vw,${heightMax}px)]`;
  const cellHeight = `h-[clamp(${heightMin}px,${heightVw}vw,${heightMax}px)]`;
  const gapClass = `gap-[${gap}px]`;
  const padClass = `px-[${itemPx}px]`;
  const durationClass = `duration-[${speed}s]`;

  return (
    <section className="w-full">
      {caption && (
        <div className="mb-6 flex items-center justify-center">
          <p className="text-center text-[14px] font-medium tracking-[0.01em] text-[#A2A2A2]">
            {caption}
          </p>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        {/* Track scrolling continuously to the left */}
        <div
          className={[
            "flex min-w-max items-center will-change-transform translate-z-0",
            "animate-marquee", // keyframes defined in globals.css
            durationClass,
            trackHeight,
            gapClass,
          ].join(" ")}
        >
          {doubled.map((logo, i) => (
            <span
              key={`${logo.src}-${i}`}
              className={[
                "inline-flex flex-none items-center justify-center",
                cellHeight,
                padClass,
              ].join(" ")}
            >
              <span className="relative aspect-[3/1] h-full w-auto min-w-[180px]">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority={i < 6}
                />
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
