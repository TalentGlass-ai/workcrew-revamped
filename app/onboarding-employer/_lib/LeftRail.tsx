// PATH: app/onboarding-employer/_lib/LeftRail.tsx
"use client";

import * as React from "react";
import Image from "next/image";

type Props = {
  title: string;
  blurb: string;
  illustration: string;      // e.g. "/cuate.png"
  bottomLink?: React.ReactNode;
};

export default function LeftRail({ title, blurb, illustration, bottomLink }: Props) {
  return (
    // width is controlled by the parent grid (one of the 2 columns)
    <section className="relative bg-[#F6F5FF]">
      {/* on desktop this block is sticky; on mobile it just flows normally */}
      <div className="flex min-h-screen flex-col justify-center px-10 py-16 md:sticky md:top-0 md:h-screen md:px-20">
        {/* logo in the top-left */}
        <Image
          src="/logo.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />

        {/* illustration and copy */}
        <div className="mx-auto w-full max-w-[360px] md:mx-0">
          <div className="flex flex-col items-start gap-6">
            <Image
              src={illustration}
              alt=""
              width={180}
              height={180}
              className="h-auto w-[180px] object-contain"
              priority
            />
            <div>
              <h1 className="text-[20px] font-semibold leading-tight text-black">
                {title}
              </h1>
              <p className="mt-3 text-[13px] leading-5 text-[#111827]/70">
                {blurb}
              </p>
            </div>
          </div>
        </div>

        {/* optional bottom link like “Skip for now” */}
        {bottomLink && (
          <div className="absolute bottom-[30px] left-[50px]">
            {bottomLink}
          </div>
        )}
      </div>
    </section>
  );
}
