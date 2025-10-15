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
    <section className={`relative w-full bg-[#4D31EC] ${className ?? ""}`}>
      <div className="relative h-[162px] w-full">
        {/* TEXT: pinned 51px from left edge */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-white"
          style={{ left: 51, right: 400 }}
        >
          <h3
            className="font-medium tracking-[0] leading-normal"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 32,
            }}
          >
            {title}
          </h3>

          <p
            className="mt-2 font-medium tracking-[0] leading-normal text-white/95 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
            }}
            title={subtitle}
          >
            {subtitle}
          </p>
        </div>

        {/* AVATAR: moved 150px right + Rah.png sized 150×150 */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: 1173 }} // 1023 + 150
        >
          {/* Backdrop circle (106×106) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[106px] w-[106px] rounded-full"
            style={{ backgroundColor: "rgba(180,165,255,0.45)" }}
            aria-hidden
          />
          {/* Rah.png (150×150, straight cut bottom) */}
          <div className="h-[150px] w-[150px] overflow-hidden">
            <Image
              src={avatarSrc}
              alt="RAHI"
              width={150}
              height={150}
              className="h-full w-full object-cover object-top border-0 ring-0 shadow-none"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetRahiBanner;
