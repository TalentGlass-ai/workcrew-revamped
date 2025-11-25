// PATH: app/about/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Section, Container } from "../../workcrew-ui/components/primitives";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";
import GlassPill from "../../workcrew-ui/components/primitives/tags/GlassPill";
import LayeredPill from "../../workcrew-ui/components/primitives/buttons/LayeredPill";
import T from "../../workcrew-ui/components/primitives/Typography";

/* helper */
const cx = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

/* same calendar + redirect behavior as pricing */
const SALES_CALENDAR_URL = "https://calendar.app.google/aLFgZjQ3dFf8oBSXA";
const DEMO_PLACEHOLDER_URL = "/demo-placeholder";

/* fallback icons if /icons/* not found */
const IconResearch = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l4.5 4.5" />
    <path d="M8 12V9M10.5 12V7.5M13 12V10" />
  </svg>
);

const IconMonitor = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

const IconGrowth = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M3 21h18" />
    <path d="M6 17V9M11 17V7M16 17v-5" />
    <path d="M12 6l3 3 5-5" />
  </svg>
);

const Bolt = ({
  className = "",
  fill = "#4D31EC",
  size = 16,
}: {
  className?: string;
  fill?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 11 18"
    className={className}
    aria-hidden
  >
    <path d="M6.3 0L0 9.1h3.9L2.7 18 11 7.8H7.1L8.3 0H6.3z" fill={fill} />
  </svg>
);

const CORE_TABS = [
  {
    id: "values",
    title: "WorkCrew.ai’s core value",
    headline: "Human first always",
    body:
      "We build with empathy. Great technology should never replace the human element. Every decision we make at WorkCrew.ai centers around helping people hire and get hired with thoughtfulness, trust, and care.",
    img: "/founder-1.png",
  },
  {
    id: "vision",
    title: "WorkCrew.ai’s vision",
    headline: "Make hiring simple, fair, and fast",
    body:
      "From AI-assisted screening to assessment-backed profiles, we design for transparency and better decisions for both recruiters and candidates.",
    img: "/founder-2.png",
  },
  {
    id: "founder",
    title: "Meet our Founder",
    headline: "Cyril Thomas",
    body:
      "Cyril leads WorkCrew.ai with a product-first philosophy: ship useful features, listen hard to users, and keep the human at the center.",
    img: "/founder-3.png",
  },
];

/* journey data */
type JourneyStep = {
  id: string;
  topLabel: string;
  year: string;
  title: string;
  blurb: string;
  altBodyIcon?: React.ReactNode;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "talentbox",
    topLabel: "TalentBox Labs launch",
    year: "2019",
    title: "TalentBox Labs launch",
    blurb:
      "TalentBox was born with a vision to bring empathy and thoughtfulness into the hiring journey. The idea was to simplify recruitment while keeping the human element at the core.",
  },
  {
    id: "research",
    topLabel: "Research & exploration",
    year: "2019",
    title: "Research & exploration",
    blurb:
      "We began by engaging early users, listening closely to candidates and recruiters, and experimenting with different approaches to understand what truly worked.",
    altBodyIcon: <IconResearch className="h-[20px] w-[20px] text-white" />,
  },
  {
    id: "prototypes",
    topLabel: "Prototype & development",
    year: "2019",
    title: "Prototypes & development",
    blurb:
      "Turning insights into action, we built and refined prototypes. This phase was about testing possibilities, iterating on feedback, and shaping the foundation for a scalable product.",
    altBodyIcon: <IconMonitor className="h-[20px] w-[20px] text-white" />,
  },
  {
    id: "launch",
    topLabel: "WorkCrew.ai launch",
    year: "2023",
    title: "WorkCrew.ai launch",
    blurb:
      "The vision took form with the launch of WorkCrew.ai, designed to make hiring smarter, faster, and more transparent. It marked our official step into the market.",
  },
  {
    id: "closed-roles",
    topLabel: "Roles closed",
    year: "2025",
    title: "Closed 500+ roles",
    blurb:
      "After the launch, we focused on adoption and continuous improvement. We integrated assessments into candidate profiling and went on to close 500+ roles, shaping a stronger, more meaningful hiring experience.",
    altBodyIcon: <IconGrowth className="h-[20px] w-[20px] text-white" />,
  },
];

/* testimonials */
type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "James Lee",
    role: "Product Manager at Google",
    quote:
      "The collaborative environment here has really elevated my skills and career!",
    avatar: "/avatars/1.png",
  },
  {
    name: "Priya S",
    role: "HR Lead at FintechCo",
    quote: "Rahi helped us screen faster without compromising quality.",
    avatar: "/avatars/2.png",
  },
  {
    name: "Arun K",
    role: "Talent Partner at StartUpX",
    quote:
      "Our time-to-hire dropped noticeably after moving to WorkCrew.ai.",
    avatar: "/avatars/3.png",
  },
  {
    name: "Meera D",
    role: "Recruiter at HealthTech",
    quote:
      "The pipeline visibility and assessment fit are game-changers.",
    avatar: "/avatars/4.png",
  },
  {
    name: "Vikram N",
    role: "Operations @ SaaSCo",
    quote: "Clean UX, thoughtful flows, and top-notch support.",
    avatar: "/avatars/5.png",
  },
  {
    name: "Alejandro Ruiz",
    role: "People Ops @ RetailCo",
    quote:
      "Shortlists are sharper and interviews stay focused—huge win for our stores.",
    avatar: "/avatars/6.png",
  },
  {
    name: "Mina Park",
    role: "TA Lead @ MedTech",
    quote:
      "We finally have consistency in screening without burning the team out.",
    avatar: "/avatars/7.png",
  },
  {
    name: "Rohan Gupta",
    role: "Founder @ NeoCloud",
    quote:
      "Loved the assessments—signal is high and noise is low.",
    avatar: "/avatars/8.png",
  },
  {
    name: "Fatima Noor",
    role: "Recruiter @ EduLabs",
    quote:
      "The team’s responsiveness and the product velocity are impressive.",
    avatar: "/avatars/9.png",
  },
  {
    name: "Lucia Rossi",
    role: "HRBP @ FinServe",
    quote:
      "Internal mobility got easier once we plugged WorkCrew into our stack.",
    avatar: "/avatars/10.png",
  },
  {
    name: "Tom Becker",
    role: "Sr. Recruiter @ BuildIt",
    quote: "Sourcing and screening time dropped by days, not hours.",
    avatar: "/avatars/1.png",
  },
  {
    name: "Yuki Tanaka",
    role: "People Partner @ StudioX",
    quote:
      "Candidates actually compliment our process now. That’s new!",
    avatar: "/avatars/2.png",
  },
];

const STATS = [
  { label: "Candidates", value: "5,000+" },
  { label: "Recruiters", value: "500+" },
  { label: "Companies", value: "300+" },
  { label: "Jobs Posted", value: "400+" },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = React.useState(CORE_TABS[0].id);

  // journey index autoplay
  const [jIndex, setJIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(
      () => setJIndex((i) => (i + 1) % JOURNEY_STEPS.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  // convo carousel
  const convoImages = React.useMemo(
    () => ["/about-team.png", "/about-team-2.png", "/about-team-3.png"],
    []
  );
  const [convoIdx, setConvoIdx] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const pausedRef = React.useRef(false);
  const timerRef = React.useRef<number | null>(null);
  const convoSectionRef = React.useRef<HTMLDivElement | null>(null);

  const clearTick = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTick = React.useCallback(() => {
    clearTick();
    timerRef.current = window.setTimeout(() => {
      if (!pausedRef.current && isVisible) {
        setConvoIdx((i) => (i + 1) % convoImages.length);
      }
    }, 10000);
  }, [clearTick, convoImages.length, isVisible]);

  React.useEffect(() => {
    const node = convoSectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => setIsVisible(entry.isIntersecting)),
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    clearTick();
    if (isVisible) scheduleTick();
    return clearTick;
  }, [convoIdx, isVisible, scheduleTick, clearTick]);

  const onConvoEnter = () => {
    pausedRef.current = true;
    clearTick();
  };
  const onConvoLeave = () => {
    pausedRef.current = false;
    if (isVisible) scheduleTick();
  };
  const onConvoDotClick = (i: number) => setConvoIdx(i);

  // rocket icons
  const SmallRocket = (
    <Image
      src="/icons/smolrocket.png"
      alt=""
      width={15}
      height={15}
      className="inline-block"
    />
  );
  const BigRocket = (
    <Image
      src="/icons/biggrocket.png"
      alt=""
      width={20}
      height={20}
      className="inline-block"
    />
  );

  // timeline % helper
  const stepCount = JOURNEY_STEPS.length;
  const getLeftPct = (i: number) => {
    if (stepCount === 1) return "0%";
    const pct = (i / (stepCount - 1)) * 100;
    return `${pct}%`;
  };

  // shared calendar behaviour (same as pricing)
  const goToCalendarThenDemo = () => {
    window.open(SALES_CALENDAR_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.location.href = DEMO_PLACEHOLDER_URL;
    }, 800);
  };

  return (
    <main className="relative min-h-screen bg-white">
      <NewNavbar />

      {/* HERO */}
      <Section className="relative overflow-hidden">
        <Container className="relative z-10 px-[50px] pt-[96px] pb-20">
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <div className="mb-4">
              <GlassPill className="px-4">who are we ?</GlassPill>
            </div>

            <div className="px-2">
              <T
                as="h1"
                variant="hero48"
                className="mx-auto text-center font-medium text-black"
                trackingPct={-1}
                lineHeightPx={66}
              >
                <span className="block text-[52px]">
                  <span className="text-black">Your </span>
                  <span className="text-[#4D31EC]">one-stop AI</span>
                </span>
                <span className="block text-[52px] text-black">
                  recruitment platform
                </span>
              </T>

              <T
                as="p"
                variant="sub20"
                weight={400}
                lineHeightPx={27}
                className="mx-auto mt-4 max-w-[820px] text-center text-black"
              >
                WorkCrew.ai is more than a hiring tool. It&apos;s an
                AI-powered recruitment platform that helps companies find and
                hire talent efficiently. We simplify the recruitment journey
                with one intelligent, human-first platform.
              </T>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={goToCalendarThenDemo}
                className="inline-block"
                aria-label="Book demo"
              >
                <span
                  className={cx(
                    "inline-flex h-[56px] items-center gap-3 rounded-full px-8",
                    "bg-[#4D31EC] font-semibold text-white",
                    "transition-all duration-200 ease-in-out hover:bg-[#3a27c5]",
                    "shadow-[0_6px_18px_rgba(77,49,236,0.35)]"
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                  <span>Book demo</span>
                </span>
              </button>
            </div>
          </div>
        </Container>

        {/* hero decoration images */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute z-20 drop-shadow-2xl [top:calc(10%-10px)] left-[-280px] rotate-[30deg]">
            <Image
              src="/hero-right.png"
              alt="Left hero image"
              width={435}
              height={480}
              priority
            />
          </div>
          <div className="absolute z-10 drop-shadow-2xl top-[8%] right-[-300px] rotate-[-30deg] opacity-95">
            <Image
              src="/hero-right.png"
              alt="Right hero image"
              width={435}
              height={480}
              priority
            />
          </div>
        </div>

        {/* soft grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-35
                     bg-[linear-gradient(#EEF1FF_1px,transparent_1px),linear-gradient(90deg,#EEF1FF_1px,transparent_1px)]
                     [background-size:40px_40px]"
        />
      </Section>

      {/* CONVERSATIONS */}
      <Section>
        <div ref={convoSectionRef}>
          <Container className="grid grid-cols-1 items-center gap-12 px-[50px] lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="mb-6">
                <GlassPill className="px-4">How we started</GlassPill>
              </div>

              <T as="h2" variant="hero48" className="text-left" lineHeightPx={56}>
                Built through conversations
              </T>

              <T
                as="p"
                variant="body16"
                weight={400}
                lineHeightPx={27}
                className="mt-5 text-left text-black"
              >
                WorkCrew.ai grew out of countless conversations with people who
                live and breathe hiring. They shared their frustrations, their
                ideas, and their hopes for something better.
                <br />
                <br />
                We owe much of our vision to the incredible HRs and recruiters
                who helped us see the bigger picture. Their experiences shaped
                our features, their honesty shaped our purpose, and their belief
                in something better continues to inspire us as we grow. These
                are the people behind the idea, the ones who made WorkCrew.ai
                possible.
              </T>
            </div>

            {/* small image carousel */}
            <div className="flex flex-col items-center lg:col-span-6">
              <div
                className="relative h-[381px] w-[386px] select-none overflow-hidden rounded-3xl"
                aria-roledescription="carousel"
                onMouseEnter={onConvoEnter}
                onMouseLeave={onConvoLeave}
              >
                <div
                  className="absolute inset-0 flex transition-transform duration-1500 ease-out
                             [transform:translateX(calc(-1*var(--slide-idx)*100%))]"
                  style={
                    { ["--slide-idx" as any]: convoIdx } as React.CSSProperties
                  }
                >
                  {convoImages.map((src, i) => (
                    <div key={i} className="relative h-full w-[386px] shrink-0">
                      <Image
                        src={src}
                        alt={`Team photo ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* nav bars */}
              <div className="mt-6 flex items-center gap-2">
                {convoImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onConvoDotClick(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cx(
                      "h-[6px] w-[20px] rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#6D5EF0]/50",
                      i === convoIdx ? "bg-[#6D5EF0]" : "bg-[#D7DBFF]"
                    )}
                  />
                ))}
              </div>
            </div>
          </Container>
        </div>
      </Section>

      {/* CORE VALUES / VISION / FOUNDER */}
      <Section className="pt-2">
        <Container className="flex flex-col items-stretch justify-between gap-12 px-[50px] lg:flex-row">
          {/* left tab list */}
          <div className="w-full max-w-[300px]">
            <div className="grid h-full grid-rows-3 content-between gap-0">
              {CORE_TABS.map((t) => {
                const activeNow = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className="w-full py-4 text-left"
                  >
                    <span className="inline-flex flex-col">
                      <span className="inline-flex items-center gap-2">
                        {activeNow && <Bolt size={16} fill="#4D31EC" />}
                        <T
                          as="span"
                          variant="body16"
                          weight={500}
                          lineHeightPx={27}
                          className={activeNow ? "text-[#4D31EC]" : "text-[#A2A2A2]"}
                        >
                          {t.title}
                        </T>
                      </span>
                      {activeNow && (
                        <span className="mt-1 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-[#4D31EC] to-transparent" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* right content card */}
          <div className="flex flex-1 items-center gap-10 rounded-3xl border border-transparent px-7 py-16 shadow-sm md:flex-row bg-[linear-gradient(135deg,#F1EEFF_0%,#F6F8FF_60%,#F9FBFF_100%)]">
            {activeTab === "values" && (
              <>
                <div className="max-w-[780px] flex-1 text-left">
                  <T as="h3" variant="card36" className="text-left">
                    Human first always
                  </T>
                  <T
                    as="p"
                    variant="body16"
                    lineHeightPx={27}
                    className="mt-4 text-black"
                  >
                    {CORE_TABS[0].body}
                  </T>
                </div>
                <div className="shrink-0">
                  <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full ring-8 ring-white/60">
                    <Image
                      src={"/Ellipse 87.png"}
                      alt="Human first always"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "vision" && (
              <div className="max-w-[780px] flex-1 text-left">
                <T as="h3" variant="card36" className="text-left">
                  Make hiring simple, fair, and fast
                </T>
                <T
                  as="p"
                  variant="body16"
                  lineHeightPx={27}
                  className="mt-4 text-black"
                >
                  {CORE_TABS[1].body}
                </T>
              </div>
            )}

            {activeTab === "founder" && (
              <>
                <div className="shrink-0">
                  <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full ring-8 ring-white/60">
                    <Image
                      src="/cyril.png"
                      alt="Cyril Thomas"
                      fill
                      className="object-cover scale-[1.2] translate-x-[10px] -translate-y-[10px]"
                    />
                  </div>
                </div>
                <div className="max-w-[780px] flex-1">
                  <T as="h3" variant="card36" className="text-left">
                    Hi, I’m <span className="text-[#4D31EC]">Cyril Thomas!</span>
                  </T>
                  <T
                    as="p"
                    variant="body16"
                    lineHeightPx={27}
                    className="mt-4 text-black"
                  >
                    {CORE_TABS[2].body}
                  </T>
                </div>
              </>
            )}
          </div>
        </Container>
      </Section>

      {/* OUR JOURNEY */}
      <section className="relative bg-[#4D31EC]">
        <Container className="relative text-white pt-[96px] pb-[96px]">
          <div className="grid min-h-[540px] grid-cols-1 gap-12 lg:grid-cols-12">
            {/* LEFT HALF */}
            <div className="lg:col-span-4 flex items-center">
              <div className="flex flex-col">
                <div
                  className={cx(
                    "flex items-center justify-center rounded-full",
                    "bg-white/10 text-white/95 ring-1 ring-inset ring-white/30",
                    "text-[14px] leading-[normal] font-normal tracking-[0.03em] font-archivo",
                    "w-[157px] h-[38px] px-4"
                  )}
                >
                  How we started
                </div>

                <div className="mt-6 text-white">
                  <h2
                    className={cx(
                      "text-[48px] leading-[normal] tracking-[0.01em]",
                      "font-medium font-schibsted"
                    )}
                  >
                    Our journey
                  </h2>
                </div>
              </div>
            </div>

            {/* RIGHT HALF */}
            <div className="lg:col-span-8 flex flex-col justify-between relative">
              <div className="relative h-[120px]">
                <div className="absolute left-0 right-0 top-[50px]">
                  <div className="relative h-[2px] w-full bg-white">
                    {JOURNEY_STEPS.map((step, i) => {
                      const active = i === jIndex;
                      const leftPct = getLeftPct(i);
                      return (
                        <React.Fragment key={step.id}>
                          {active && (
                            <div
                              className={cx(
                                "absolute -translate-x-1/2 -translate-y-[calc(100%+12px)]",
                                "flex flex-col text-left text-white font-archivo"
                              )}
                              style={{ left: leftPct }}
                            >
                              <span
                                className={cx(
                                  "flex items-center gap-2",
                                  "text-[16px] leading-[normal] font-normal tracking-[0.03em]"
                                )}
                              >
                                <span className="inline-flex h-[16px] w-[16px] items-center justify-center">
                                  {SmallRocket}
                                </span>
                                {step.topLabel}
                              </span>

                              <span className="mt-[2px] text-[16px] leading-[normal] font-normal tracking-[0.03em]">
                                {step.year}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={() => setJIndex(i)}
                            aria-label={`Go to ${step.title}`}
                            className={cx(
                              "absolute rounded-full bg-white transition-all",
                              active ? "h-[16px] w-[16px]" : "h-[8px] w-[8px]"
                            )}
                            style={{
                              left: leftPct,
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pr-4">
                <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  {JOURNEY_STEPS[jIndex].altBodyIcon ? (
                    JOURNEY_STEPS[jIndex].altBodyIcon
                  ) : (
                    <span className="inline-flex h-[20px] w-[20px] items-center justify-center">
                      {BigRocket}
                    </span>
                  )}
                </div>

                <h3
                  className={cx(
                    "text-white font-[540] font-schibsted",
                    "text-[36px] leading-[normal] tracking-[0.01em]"
                  )}
                >
                  {JOURNEY_STEPS[jIndex].title}
                </h3>

                <p
                  className={cx(
                    "mt-4 max-w-3xl text-white/95 font-archivo",
                    "text-[16px] font-normal leading-[27px] tracking-[0.03em]"
                  )}
                >
                  {JOURNEY_STEPS[jIndex].blurb}
                </p>
              </div>

              <div className="pt-10">
                <div className="flex flex-wrap items-center gap-4">
                  {JOURNEY_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setJIndex(i)}
                      aria-label={`Go to journey step ${i + 1}`}
                      className={cx(
                        "h-[6px] w-[90px] rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50",
                        i === jIndex ? "bg-white" : "bg-white/35"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* RAHI */}
      <Section className="my-[100px]">
        <Container className="grid grid-cols-1 items-center gap-10 px-[50px] lg:grid-cols-12">
          <div className="lg:col-span-7">
            <GlassPill className="mb-6 px-4">How we started</GlassPill>
            <T as="h2" variant="hero48" className="text-left">
              Say Hi to <span className="text-[#4D31EC]">Rahi</span>!
            </T>

            <T
              as="p"
              variant="body16"
              weight={400}
              lineHeightPx={27}
              className="mt-5 text-left text-black"
            >
              Rahi is the AI assistant built into WorkCrew.ai, designed to
              simplify, automate, and humanize recruitment. She helps companies
              screen thousands of resumes, conduct smart interviews, and assess
              culture-fit. From matching candidates to the right roles to
              running interviews and assessments, Rahi supports both sides of
              the hiring journey with precision and empathy.
            </T>
          </div>

          {/* concentric rings + avatar */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto h-[227px] w-[227px]">
              <span
                className="absolute left-1/2 top-1/2 h-[208px] w-[208px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#C778F8]"
                aria-hidden
              />
              <span
                className="absolute left-1/2 top-1/2 h-[187px] w-[187px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#4D31EC]"
                aria-hidden
              />
              <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-8 ring-[#3C34D9]/20 bg-[#3C34D9]">
                <Image
                  src="/Rah.png"
                  alt="Rahi"
                  fill
                  className="object-cover object-[50%_25%]"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS + STATS */}
      <Section>
        <Container className="px-[50px]">
          <T
            as="h2"
            variant="hero48"
            weight={600}
            lineHeightPx={60}
            className="mb-12 text-center"
          >
            Testimonials
          </T>
        </Container>

        {/* full-bleed scroller */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CarouselEndless items={TESTIMONIALS} cardW={360} cardH={215} />
        </div>

        <Container className="px-[50px]">
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-r from-[#F2F4FF] to-[#F9FAFF] p-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[28px] font-semibold leading-[32px] text-[#111827]">
                  {s.value}
                </div>
                <div className="text-sm text-[#7A8595]">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="pb-20">
        <Container className="px-[50px]">
          <div className="relative overflow-hidden rounded-3xl bg-[#4D31EC]">
            <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-12 lg:p-12">
              <div className="lg:col-span-8">
                <T
                  as="h3"
                  variant="sub20"
                  className="text-white"
                  lineHeightPx={42}
                  trackingPct={1}
                  weight={500}
                >
                  Curious how WorkCrew.ai can fit into your hiring workflow?
                </T>

                <T as="p" variant="body16" className="mt-3 text-white/90">
                  Let’s talk. Our team can walk you through how it works, what
                  it solves, and how fast you can get started.
                </T>

                <div className="mt-6">
  <LayeredPill
    label="Book a demo"
    size="md"
    onClick={goToCalendarThenDemo}
    aria-label="Book a demo"
    className={cx(
      "text-[#4D31EC]",
      "[--pill-middle-bg:#FFFFFF]",
      "[--pill-shadow:0_1px_0_rgba(17,24,39,0.06)]",
      "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-[#4D31EC] [&_svg]:text-[#4D31EC]"
    )}
  />
</div>

              </div>

              <div className="relative lg:col-span-4">
                <div className="relative ml-auto h-[267px] w-[220px]">
                  <Image
                    src="/cta-lady.png"
                    alt="Friendly team member"
                    width={220}
                    height={267}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <NewFooter />
    </main>
  );
}

/* endless testimonials carousel */
function CarouselEndless({
  items,
  cardW = 360,
  cardH = 215,
}: {
  items: Testimonial[];
  cardW?: number;
  cardH?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  // triple for seamless loop
  const LOOPED = React.useMemo(() => [...items, ...items, ...items], [items]);

  const GAP = 24;
  const SINGLE_SET_WIDTH = React.useMemo(
    () => (LOOPED.length > 0 ? items.length * (cardW + GAP) - GAP : 0),
    [items.length, cardW, LOOPED.length]
  );

  const initScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // center on middle set
    el.scrollLeft = SINGLE_SET_WIDTH;
  }, [SINGLE_SET_WIDTH]);

  const normalizeScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const left = el.scrollLeft;
    if (left < SINGLE_SET_WIDTH * 0.5) {
      el.scrollLeft = left + SINGLE_SET_WIDTH;
    } else if (left > SINGLE_SET_WIDTH * 1.5) {
      el.scrollLeft = left - SINGLE_SET_WIDTH;
    }
  }, [SINGLE_SET_WIDTH]);

  React.useEffect(() => {
    const id = requestAnimationFrame(initScroll);
    return () => cancelAnimationFrame(id);
  }, [initScroll]);

  const slideByOne = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const delta = (dir === "left" ? -1 : 1) * (cardW + GAP);
    el.scrollBy({ left: delta, behavior: "smooth" });
    window.setTimeout(normalizeScroll, 400);
  };

  return (
    <div
      className="relative"
      style={
        {
          ["--card-w" as any]: `${cardW}px`,
          ["--card-h" as any]: `${cardH}px`,
        } as React.CSSProperties
      }
    >
      <div ref={containerRef} className="overflow-x-hidden">
        <div
          ref={trackRef}
          className="flex w-max gap-6 px-6 pb-2 sm:px-10"
          style={{ ["--gap" as any]: `${GAP}px` } as React.CSSProperties}
        >
          {LOOPED.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="flex h-[var(--card-h)] w-[var(--card-w)] shrink-0 flex-col justify-between rounded-2xl border border-[#E7EBF2] bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#EEF2FF]">
                  <Image
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[20px] font-semibold leading-[28px] text-[#111827]">
                    {t.name}
                  </div>
                  <div className="truncate text-sm text-[#6B7280]">
                    {t.role}
                  </div>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-[16px] leading-[24px] text-[#111827]">
                {t.quote}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* chevrons */}
      <div className="mt-6 flex w-full items-center justify-center gap-8">
        <button
          onClick={() => slideByOne("left")}
          aria-label="Slide testimonials left"
          className="p-2 text-[#111827] transition hover:-translate-x-0.5 hover:opacity-80 focus:outline-none"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          onClick={() => slideByOne("right")}
          aria-label="Slide testimonials right"
          className="p-2 text-[#111827] transition hover:translate-x-0.5 hover:opacity-80 focus:outline-none"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
