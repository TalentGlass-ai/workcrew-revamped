// PATH: app/page.tsx
"use client";

import * as React from "react";
import {
  NewNavbar,
  HeroSection,
  MeetRahiBanner,
  WhyTheyLoveUs,
  WhyLoveUs,
  ReviewsSection,
  NewFooter,
  ContactUs, // ✅ make sure ContactUs is exported from ../workcrew-ui/components/landing/index.ts
} from "../workcrew-ui/components/landing";

import JobRoles from "../workcrew-ui/components/landing/JobRoles";
import { Section } from "../workcrew-ui/components/primitives";
import FadeWrapper from "../workcrew-ui/components/FadeWrapper";

/* Wrapper with no default vertical padding */
function GapSection({ children }: { children: React.ReactNode }) {
  return (
    <Section
      size="lg"
      background="default"
      withContainer={false}
      className="!py-0"
    >
      {children}
    </Section>
  );
}

/*  MAIN PAGE*/
export default function HomePage(): React.ReactElement {
  return (
    <>
      {/* Navbar */}
      <NewNavbar />

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        #contact {
          scroll-margin-top: 92px; /* offset for fixed navbar */
        }
      `}</style>

      <main className="flex flex-col space-y-[60px] [&>*]:my-0">
        {/* Hero Section (no fade so it shows immediately) */}
        <HeroSection />

        {/* Why They Love Us */}
        <GapSection>
          <FadeWrapper>
            <WhyTheyLoveUs />
          </FadeWrapper>
        </GapSection>

        {/* Meet RAHI — reduced top/bottom gap */}
        <div className="!mt-[8px] !mb-[16px]">
          <GapSection>
            <FadeWrapper>
              <MeetRahiBanner className="!my-0 !py-0" />
            </FadeWrapper>
          </GapSection>
        </div>

        {/* Why Love Us */}
        <GapSection>
          <FadeWrapper>
            <WhyLoveUs />
          </FadeWrapper>
        </GapSection>

        {/* Statement Strip */}
        <GapSection>
          <FadeWrapper>
            <div className="mx-auto max-w-[1106px] text-center">
              <div className="mx-auto flex flex-col items-center gap-[76px]">
                <div className="h-px w-[320px] bg-[#D0D5DD]" />
                <div className="mx-auto max-w-[625px]">
                  <h2 className="font-display text-[40px] font-medium leading-[1] tracking-[0.01em] text-black">
                    “WorkCrew.ai fixed the broken system.” – We say
                  </h2>
                  <p className="mt-6 font-display text-[32px] font-medium leading-[1] tracking-[0.01em] text-[#4D31EC]">
                    Here’s what that means for you – New opportunities!
                  </p>
                </div>
                <div className="h-px w-[320px] bg-[#D0D5DD]" />
              </div>
            </div>
          </FadeWrapper>
        </GapSection>

        {/* Job Roles */}
        <GapSection>
          <FadeWrapper>
            <JobRoles />
          </FadeWrapper>
        </GapSection>

        {/* Reviews */}
        <GapSection>
          <FadeWrapper>
            <ReviewsSection />
          </FadeWrapper>
        </GapSection>

        {/* ✅ ContactUs component that actually hits backend */}
        <GapSection>
          <FadeWrapper>
            <div className="mb-[30px]">
              <ContactUs />
            </div>
          </FadeWrapper>
        </GapSection>
      </main>

      {/* Footer */}
      <NewFooter />
    </>
  );
}
