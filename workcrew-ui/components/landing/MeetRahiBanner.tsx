"use client";

import * as React from "react";
import Image from "next/image";

type Props = {
  title?: string;
  subtitle?: string;
  avatarSrc?: string;
  className?: string;
};

/* Simple banner introducing RAHI with text at left and avatar at right */
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
        {/* Text block (fixed offsets per spec) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-[51px] right-[400px] text-white">
          <h3 className="font-sans text-[32px] font-medium leading-normal tracking-[0]">
            {title}
          </h3>
          <p
            className="mt-2 whitespace-nowrap font-sans text-[16px] font-medium leading-normal tracking-[0] text-white/95"
            title={subtitle}
          >
            {subtitle}
          </p>
        </div>

        {/* Avatar block (fixed left offset) */}
        <div className="absolute top-1/2 left-[1173px] -translate-y-1/2">
          {/* Soft halo behind avatar */}
          <div
            className="-z-10 absolute left-1/2 top-1/2 h-[106px] w-[106px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(180,165,255,0.45)]"
            aria-hidden
          />
          {/* RAHI image */}
          <div className="h-[150px] w-[150px] overflow-hidden">
            <Image
              src={avatarSrc}
              alt="RAHI"
              width={150}
              height={150}
              className="h-full w-full object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetRahiBanner;
