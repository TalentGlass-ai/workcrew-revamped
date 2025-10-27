// PATH: app/onboarding-employer/_lib/LeftRail.tsx
"use client";

import * as React from "react";
import Image from "next/image";

type Props = {
  title: string;
  blurb: string;
  illustration: string;            // e.g. "/cuate.png"
  bottomLink?: React.ReactNode;    // OPTIONAL: e.g. a "Skip for now" link/button
};

export default function LeftRail({ title, blurb, illustration, bottomLink }: Props) {
  return (
    <section className="relative flex min-h-screen flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
      {/* Logo pinned 50/50 */}
      <Image
        src="/logo.png"
        alt="WorkCrew.ai"
        width={116}
        height={21}
        className="absolute left-[50px] top-[50px]"
        priority
      />

      {/* Illustration + copy aligned to same left edge */}
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

      {/* Optional bottom-left link/button (e.g., "Skip for now") */}
      {bottomLink && (
        <div className="absolute bottom-[30px] left-[50px]">
          {bottomLink}
        </div>
      )}
    </section>
  );
}
