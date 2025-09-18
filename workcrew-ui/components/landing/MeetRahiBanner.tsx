"use client";

import * as React from "react";
import Image from "next/image";

type Props = {
  title?: string;
  subtitle?: string;
  /** Path under /public (default: /Rah.png) */
  avatarSrc?: string;
  className?: string;
};

const MeetRahiBanner: React.FC<Props> = ({
  title = "Meet RAHI!",
  subtitle =
    "RAHI - Recruitment, Automation, Hiring Intelligence. From resume tips to talent insights, she supports smarter decisions for all.",
  avatarSrc = "/Rah.png",
  className,
}) => {
  return (
    <section className={`w-full bg-[#4D31EC] ${className ?? ""}`}>
      {/* Desktop spec: 1280 x 162 */}
      <div className="relative mx-auto h-[162px] w-full max-w-[1280px] px-6 md:px-8">
        {/* Text block */}
        <div className="absolute left-6 right-[168px] top-1/2 -translate-y-1/2 text-white md:left-8 md:right-[184px]">
          <h3
            className="text-[32px] font-medium leading-[1] tracking-[0]"
            style={{ fontFamily: "var(--font-sans)" }} // Archivo
          >
            {title}
          </h3>
          <p
            className="mt-3 text-[16px] font-medium leading-[1] tracking-[0] text-white/95"
            style={{ fontFamily: "var(--font-sans)" }} // Archivo
          >
            {subtitle}
          </p>
        </div>

        {/* Avatar block (fixed to the right) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 md:right-8">
          {/* soft circular backdrop per Figma */}
          <div
            className="absolute -left-4 -top-4 -z-10 h-[145px] w-[145px] rounded-full bg-white/15"
            aria-hidden
          />
          <Image
            src={avatarSrc}
            alt="RAHI"
            width={113}
            height={113}
            className="h-[113px] w-[113px] rounded-full object-cover ring-4 ring-white/20"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default MeetRahiBanner;
