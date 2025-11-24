"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import LogoMarquee from "./LogoMarquee";
import FeatureSlides from "./FeatureSlides";
import T from "../primitives/Typography";
import GlassPill from "../primitives/tags/GlassPill";
import { CandidateAuth, RecruiterAuth } from "../../lib/endpoints";

/* top hero of the landing — keep spacing owned by the page wrapper, not here */
export default function HeroSection(): React.ReactElement {
  const router = useRouter();

  const [authRole, setAuthRole] = React.useState<
    "candidate" | "recruiter" | "none"
  >("none");

  // Detect whether user is logged in as candidate or recruiter
  React.useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        // Try candidate first
        await CandidateAuth.me();
        if (!cancelled) setAuthRole("candidate");
        return;
      } catch {
        // ignore
      }

      try {
        // Then try recruiter
        await RecruiterAuth.me();
        if (!cancelled) setAuthRole("recruiter");
        return;
      } catch {
        // ignore
      }

      if (!cancelled) setAuthRole("none");
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFindWorkClick = () => {
    if (authRole === "candidate") {
      // already logged in as candidate → go straight to jobs
      router.push("/find-jobs");
    } else {
      // not logged in / recruiter logged in → candidate login
      router.push("/login?role=candidate");
    }
  };

  const handleStartHiringClick = () => {
    if (authRole === "recruiter") {
      // already logged in as recruiter → go to recruiter/employer area
      // TODO: update this path if your final recruiter dashboard route is different
      router.push("/employer/dashboard");
    } else {
      // not logged in / candidate logged in → recruiter login
      router.push("/login?role=recruiter");
    }
  };

  return (
    <section className="relative !my-0 !py-0">
      <div className="hero-top relative min-h-[740px] overflow-hidden">
        {/* soft gradient bg + subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(246,247,252,0.95)_0%,rgba(236,239,248,0.92)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-0 opacity-30 bg-[linear-gradient(rgba(163,157,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(163,157,255,0.25)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        {/* main content grid */}
        <div className="relative z-10 mx-auto max-w-[1440px] pl-[51px] pr-[51px] pb-24 md:pb-28">
          <div className="grid items-start gap-10 md:grid-cols-2 md:gap-8">
            {/* left column */}
            <div className="mt-[100px]">
              <div className="mb-6">
                <GlassPill
                  text="The future of hiring is here"
                  iconColor="#4D31EC"
                />
              </div>

              <h1>
                <T
                  as="div"
                  variant="hero48"
                  weight={540}
                  className="text-left text-[#4D31EC]"
                  autoLeading
                >
                  Hiring or job hunting?
                </T>
                <T
                  as="div"
                  variant="hero48"
                  weight={540}
                  className="mt-5 text-left text-black"
                  autoLeading
                >
                  You’re in the right place.
                </T>
              </h1>

              <T
                as="p"
                variant="sub20"
                weight={400}
                lineHeightPx={27}
                trackingPct={3}
                className="text-balance mt-6 max-w-[720px] text-black"
              >
                An AI-powered hiring experience that helps candidates find the
                right role and recruiters hire faster, smarter, better.
              </T>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleFindWorkClick}
                  className="inline-flex h-[50px] items-center gap-2 rounded-full px-6 leading-none text-[#4D31EC] transition hover:brightness-105 active:translate-y-[1px] border-[1.5px] border-[#6C55FF] bg-[linear-gradient(180deg,rgba(108,85,255,0.06)_0%,rgba(108,85,255,0.03)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_rgba(91,75,255,0.18)]"
                >
                  <ArrowNortheast />
                  <T as="span" variant="sub14" weight={600} trackingPct={2}>
                    Find work
                  </T>
                </button>

                <button
                  onClick={handleStartHiringClick}
                  className="inline-flex h-[50px] items-center gap-2 rounded-full px-6 leading-none text-white shadow-[0_10px_24px_rgba(91,75,255,0.28)] hover:brightness-105 bg-[#5B4BFF]"
                >
                  <ArrowNortheast />
                  <T as="span" variant="sub14" weight={600} trackingPct={2}>
                    Start hiring
                  </T>
                </button>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-4 gap-6 text-center md:text-left">
                <Stat number="5,000+" label="Candidates" />
                <Stat number="500+" label="Recruiters" />
                <Stat number="300+" label="Companies" />
                <Stat number="400+" label="Jobs Posted" />
              </div>
            </div>
          </div>
        </div>

        {/* right illustration */}
        <div className="relative z-10 mx-auto mt-10 w-[510px] max-w-[92vw] md:absolute md:right-6 md:top-1/2 md:mt-0 md:-translate-y-1/2">
          <div className="relative w-[510px] overflow-hidden rounded-[24px]">
            <div className="min-h-[320px]">
              <Image
                src="/hero-right.png"
                alt="WorkCrew preview"
                width={510}
                height={420}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* partner logos */}
      <div className="mt-[calc(8px+30px)] md:mt-[calc(8px+30px)]">
        <LogoMarquee
          heightMax={64}
          heightMin={40}
          heightVw={8}
          repeat={32}
          speed={28}
        />
      </div>

      {/* statement block */}
      <div className="mx-auto max-w-4xl px-6 py-[80px] md:py-[100px]">
        <div className="mb-14 h-px w-full bg-[#E5E7EB] md:mb-16" />
        <div className="text-center">
          <T
            as="div"
            variant="h1"
            weight={540}
            lineHeightPx={52}
            className="text-black"
          >
            “Recruiting &amp; job searching are fundamentally broken” – They
            say.
          </T>
          <div className="mt-5">
            <T
              as="div"
              variant="card36"
              weight={540}
              lineHeightPx={28}
              className="text-[#4D31EC]"
            >
              But we have solved every problem for you
            </T>
          </div>
        </div>
        <div className="mt-14 h-px w-full bg-[#E5E7EB] md:mt-16" />
      </div>

      <FeatureSlides />
    </section>
  );
}

/* stat block */
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <T as="div" variant="statNumber" className="text-black">
        {number}
      </T>
      <T as="div" variant="statLabel" className="text-[#7B72AF]">
        {label}
      </T>
    </div>
  );
}

/* arrow icon */
function ArrowNortheast() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M7 17L17 7M7 7h10v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
