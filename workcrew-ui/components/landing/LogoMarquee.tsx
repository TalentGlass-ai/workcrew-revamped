"use client";

import * as React from "react";
import Image from "next/image";

type LogoItem = { src: string; alt: string };

type Props = {
  speed?: number;
  caption?: string;
  logos?: LogoItem[];
  heightMax?: number;
  heightMin?: number;
  heightVw?: number;
  gap?: number;
  itemPx?: number;
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
  logos,
  heightMax = 64,   // ⬅️ was 44 — increased for bigger logos
  heightMin = 40,   // ⬅️ was 28
  heightVw = 8,     // ⬅️ was 6 — grows slightly with viewport width
  gap = 32,         // ⬅️ a bit more breathing space between logos
  itemPx = 16,      // ⬅️ more padding on sides
  repeat = 24,
}: Props) {
  const srcLogos = (logos && logos.length > 0) ? logos : BASE_LOGOS;

  const safeRepeat = React.useMemo(() => {
    if (srcLogos.length < 2) return Math.max(repeat, 64);
    if (srcLogos.length < 4) return Math.max(repeat, 40);
    return repeat;
  }, [srcLogos.length, repeat]);

  const longList = React.useMemo(
    () => Array.from({ length: safeRepeat }, (_, i) => srcLogos[i % srcLogos.length]),
    [srcLogos, safeRepeat]
  );
  const doubled = React.useMemo(() => [...longList, ...longList], [longList]);

  const vars = {
    ["--speed" as any]: `${speed}s`,
    ["--gap" as any]: `${gap}px`,
    ["--item-px" as any]: `${itemPx}px`,
    ["--h-max" as any]: `${heightMax}px`,
    ["--h-min" as any]: `${heightMin}px`,
    ["--h-vw" as any]: `${heightVw}vw`,
  } as React.CSSProperties;

  return (
    <section className="w-full">
      {caption ? (
        <div className="mb-6 flex items-center justify-center">
          <p className="text-center text-[14px] font-medium tracking-[0.01em] text-[#A2A2A2]">
            {caption}
          </p>
        </div>
      ) : null}

      <div className="relative w-full overflow-hidden">
        <div className="marquee-track" style={vars}>
          {doubled.map((logo, i) => (
            <span className="logo-cell" key={`${logo.src}-${i}`}>
              <span className="logo-img-wrap">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                  priority={i < 6}
                />
              </span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          gap: var(--gap);
          align-items: center;
          min-width: max-content;
          min-height: clamp(var(--h-min), var(--h-vw), var(--h-max));
          will-change: transform;
          animation: marquee var(--speed) linear infinite;
          transform: translateZ(0);
        }

        .logo-cell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: clamp(var(--h-min), var(--h-vw), var(--h-max));
          padding: 0 var(--item-px);
          flex: 0 0 auto;
        }

        .logo-img-wrap {
          position: relative;
          height: 100%;
          width: auto;
          min-width: 80px; /* bigger baseline width */
          aspect-ratio: 3 / 1;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
