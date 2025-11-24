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
  className?: string;   
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
  heightMax = 128,
  heightMin = 80,
  heightVw = 16,
  gap = 12,
  itemPx = 12,
  repeat = 24,
  className,
}: Props) {
  const srcLogos = logos && logos.length > 0 ? logos : BASE_LOGOS;


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

  return (
  
    <section className={`w-full !my-0 !py-0 ${className ?? ""}`}>
      {caption && (
        <div className="mb-6 flex items-center justify-center">
          <p className="text-center text-[14px] font-medium tracking-[0.01em] text-[#A2A2A2]">
            {caption}
          </p>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        {/* Track */}
        <div
          className={[
            "flex min-w-max items-center will-change-transform translate-z-0",
            "animate-marquee",

            "min-h-[clamp(var(--h-min),var(--h-vw),var(--h-max))]",
            "gap-[var(--gap)]",
          ].join(" ")}
          style={
            {
             
              ["--dur" as any]: `${speed}s`,
              ["--h-min" as any]: `${heightMin}px`,
              ["--h-vw" as any]: `${heightVw}vw`,
              ["--h-max" as any]: `${heightMax}px`,
              ["--gap" as any]: `${gap}px`,
              ["--item-px" as any]: `${itemPx}px`,
            } as React.CSSProperties
          }
        >
          {doubled.map((logo, i) => (
            <span
              key={`${logo.src}-${i}`}
              className={[
                "inline-flex flex-none items-center justify-center",
                "h-[clamp(var(--h-min),var(--h-vw),var(--h-max))]",
                "px-[var(--item-px)]",
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
