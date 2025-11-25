"use client";

import * as React from "react";
import Image from "next/image";
import T from "../primitives/Typography";

const MeetRahiBanner: React.FC<{
  title?: string;
  subtitle?: string;
  avatarSrc?: string;
  className?: string;
}> = ({
  title = "Meet RAHI!",
  subtitle =
    "RAHI - Recruitment, Automation, Hiring Intelligence. From resume tips to talent insights, she supports smarter decisions for all.",
  avatarSrc = "/Rah.png",
  className,
}) => {
  return (
    /* section has no outer margins — we rely on <main> spacing */
    <section
      className={`relative w-full overflow-hidden !my-0 !py-0 bg-[#4D31EC] ${className ?? ""}`}
    >
      {/* inner wrapper manages height and side padding */}
      <div className="relative flex h-[162px] w-full items-center justify-between px-[51px] py-[20px]">
        {/* left side: text content */}
        <div className="flex flex-col text-white pr-4">
          <T as="h3" variant="h2" className="leading-normal font-medium text-white">
            {title}
          </T>

          <T
            as="p"
            variant="body16"
            className="mt-2 leading-normal font-medium text-white/95 whitespace-nowrap"
          >
            {subtitle}
          </T>
        </div>

        <div className="relative flex-shrink-0">
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-[106px] w-[106px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(180,165,255,0.45)]"
            aria-hidden
          />
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
