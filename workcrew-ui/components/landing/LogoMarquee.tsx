"use client";

import * as React from "react";
import Image from "next/image";

type LogoItem = { src: string; alt: string };

type Props = {
  /** seconds per full loop */
  speed?: number;
  /** text shown between the divider lines */
  caption?: string;
  /** override logos if you want */
  logos?: LogoItem[];
};

const DEFAULT_LOGOS: LogoItem[] = [
  { src: "/brands/company1.png", alt: "Azul" },
  { src: "/brands/company2.png", alt: "Linarc" },
  { src: "/brands/company3.png", alt: "Canopus" },
];

export default function LogoMarquee({
  speed = 24,
  caption = "- Loved by startups, scale-ups, and hiring platforms -",
  logos = DEFAULT_LOGOS,
}: Props) {
  const loop = React.useMemo(() => [...logos, ...logos, ...logos], [logos]);
  // 👆 tripled the logos so the train is longer

  return (
    <section className="w-full">
      {/* Caption */}
      <div className="flex items-center justify-center mb-5">
        <span className="h-px bg-black/40 w-32" />
        <p className="mx-4 text-[14px] font-medium tracking-[0.01em] text-[#A2A2A2] text-center">
          {caption}
        </p>
        <span className="h-px bg-black/40 w-32" />
      </div>

      {/* Full-width logo bar */}
      <div className="w-full">
        <div className="relative overflow-hidden w-full h-[140px]">
          {/* black background */}
          <div className="absolute inset-0 bg-black" />

          {/* scrolling track */}
          <div
            className="absolute left-0 top-0 h-full flex items-center"
            style={{
              width: "300%", // enough to cover 3x logos
              animation: `lm-scroll ${speed}s linear infinite`,
            }}
          >
            <Row logos={loop} />
          </div>

          <style jsx>{`
            @keyframes lm-scroll {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(-33.3333%);
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}

function Row({ logos }: { logos: LogoItem[] }) {
  return (
    <div className="flex items-center gap-16 px-16">
      {logos.map((logo, i) => (
        <Tile key={`${logo.src}-${i}`} {...logo} />
      ))}
    </div>
  );
}

function Tile({ src, alt }: LogoItem) {
  return (
    <div
      className="flex items-center justify-center bg-white shadow-sm"
      style={{
        width: 104, // bigger card
        height: 104,
        borderRadius: 16,
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          width: 80,
          height: 70,
          borderRadius: 6,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={80}
          height={70}
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
          priority
        />
      </div>
    </div>
  );
}
