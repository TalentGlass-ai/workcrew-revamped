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

/* tiny helper for class merging */
const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

const Bolt = ({
  className = "",
  fill = "#4D31EC",
  size = 16,
}: {
  className?: string;
  fill?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 11 18" className={className} aria-hidden>
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

const JOURNEY_STEPS = [
  {
    id: "research",
    topLabel: "Research & exploration",
    year: "2019",
    iconPath: "M9 2l2 4 4 1-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-1 2-4z",
    title: "Research & exploration",
    blurb:
      "We began by engaging early users, listening closely to candidates and recruiters, and experimenting to understand what truly worked.",
  },
  {
    id: "talentbox",
    topLabel: "TalentBox Labs launch",
    year: "2019",
    iconPath: "M12 2l-2 6H5l5 3-2 6 4-3 4 3-2-6 5-3h-5l-2-6z",
    title: "TalentBox Labs launch",
    blurb:
      "TalentBox was born with a vision to bring empathy and thoughtfulness into the hiring journey while keeping the human element at the core.",
  },
  {
    id: "prototypes",
    topLabel: "Prototype & development",
    year: "2021",
    iconPath: "M4 14l8-8 8 8-8 8-8-8zm8-5l5 5-5 5-5-5 5-5z",
    title: "Prototypes & development",
    blurb:
      "Turning insights into action, we built and refined prototypes, tested possibilities, and iterated on feedback to shape a scalable product.",
  },
  {
    id: "launch",
    topLabel: "WorkCrew.ai launch",
    year: "2023",
    iconPath: "M2 12h20M12 2v20",
    title: "WorkCrew.ai launch",
    blurb:
      "Our one-stop AI solution took shape—making hiring smarter, faster, and more transparent while centering people in every decision.",
  },
  {
    id: "closed-roles",
    topLabel: "Roles closed",
    year: "2025",
    iconPath: "M3 12l5 5L21 4",
    title: "Closed 500+ roles",
    blurb:
      "We focused on adoption and continuous improvement, integrating assessments and helping teams close 500+ roles with meaning.",
  },
];

const TESTIMONIALS = [
  { name: "James Lee", role: "Product Manager at Google", quote: "The collaborative environment here has really elevated my skills and career!" },
  { name: "Priya S", role: "HR Lead at FintechCo", quote: "Rahi helped us screen faster without compromising quality." },
  { name: "Arun K", role: "Talent Partner at StartUpX", quote: "Our time-to-hire dropped noticeably after moving to WorkCrew.ai." },
  { name: "Meera D", role: "Recruiter at HealthTech", quote: "The pipeline visibility and assessment fit are game-changers." },
  { name: "Vikram N", role: "Operations @ SaaSCo", quote: "Clean UX, thoughtful flows, and top-notch support." },
];

const STATS = [
  { label: "Candidates", value: "5,000+" },
  { label: "Recruiters", value: "500+" },
  { label: "Companies", value: "300+" },
  { label: "Jobs Posted", value: "400+" },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = React.useState(CORE_TABS[0].id);

  /* auto-advance the journey progress bar label */
  const [jIndex, setJIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(
      () => setJIndex((i) => (i + 1) % JOURNEY_STEPS.length),
      2000
    );
    return () => clearInterval(id);
  }, []);

  /* conversations carousel: resettable 5s autoplay with hover pause */
  const convoImages = React.useMemo(
    () => ["/about-team.png", "/about-team-2.png", "/about-team-3.png"],
    []
  );
  const [convoIdx, setConvoIdx] = React.useState(0);
  const convoPausedRef = React.useRef(false);
  const convoTimerRef = React.useRef<number | null>(null);

  const clearConvoTimer = React.useCallback(() => {
    if (convoTimerRef.current) {
      window.clearTimeout(convoTimerRef.current);
      convoTimerRef.current = null;
    }
  }, []);

  const scheduleConvoTick = React.useCallback(() => {
    clearConvoTimer();
    convoTimerRef.current = window.setTimeout(() => {
      if (!convoPausedRef.current) {
        setConvoIdx((i) => (i + 1) % convoImages.length);
      }
    }, 5000);
  }, [clearConvoTimer, convoImages.length]);

  React.useEffect(() => {
    scheduleConvoTick();           // (re)schedule after each index change
    return clearConvoTimer;        // cleanup on unmount
  }, [convoIdx, scheduleConvoTick, clearConvoTimer]);

  const onConvoEnter = () => {
    convoPausedRef.current = true;
    clearConvoTimer();
  };
  const onConvoLeave = () => {
    convoPausedRef.current = false;
    scheduleConvoTick();
  };

  const onConvoDotClick = (i: number) => {
    setConvoIdx(i);     // timer will be rescheduled by the effect above (5s gap)
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
                WorkCrew.ai is more than a hiring tool. It&apos;s an AI-powered
                recruitment platform that helps companies find and hire talent
                efficiently. We simplify the recruitment journey with one
                intelligent, human-first platform.
              </T>
            </div>

            <div className="mt-8">
              <Link href="/contact" className="inline-block" aria-label="Book demo">
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
              </Link>
            </div>
          </div>
        </Container>

        {/* hero decoration images */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute z-20 drop-shadow-2xl [top:calc(10%-10px)] left-[-280px] rotate-[30deg]">
            <Image src="/hero-right.png" alt="Left hero image" width={435} height={480} priority />
          </div>
          <div className="absolute z-10 drop-shadow-2xl top-[8%] right-[-300px] rotate-[-30deg] opacity-95">
            <Image src="/hero-right.png" alt="Right hero image" width={435} height={480} priority />
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
              We owe much of our vision to the incredible HRs and recruiters who
              helped us see the bigger picture. Their experiences shaped our
              features, their honesty shaped our purpose, and their belief in
              something better continues to inspire us as we grow. These are the
              people behind the idea, the ones who made WorkCrew.ai possible.
            </T>
          </div>

          {/* small image carousel with 5s gap autoplay */}
          <div className="flex flex-col items-center lg:col-span-6">
            <div
              className="relative h-[381px] w-[386px] select-none overflow-hidden rounded-3xl"
              aria-roledescription="carousel"
              onMouseEnter={onConvoEnter}
              onMouseLeave={onConvoLeave}
            >
              <div
                style={
                  {
                    "--slide-idx": convoIdx,
                    "--slide-count": convoImages.length,
                  } as React.CSSProperties
                }
                className="absolute inset-0 flex transition-transform duration-700 ease-out
                           [transform:translateX(calc(-1*var(--slide-idx)*100%))]
                           [width:calc(var(--slide-count)*100%)]"
              >
                {convoImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-full [width:calc(100%/var(--slide-count))]"
                  >
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

            <div className="mt-3 flex items-center gap-2">
              {convoImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onConvoDotClick(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cx(
                    "h-[6px] rounded-full transition-all",
                    i === convoIdx ? "w-[42px] bg-[#6D5EF0]" : "w-[10px] bg-[rgba(109,94,240,0.35)]"
                  )}
                />
              ))}
            </div>
          </div>
        </Container>
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
                    className="relative w-full py-4 text-left"
                  >
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
                      <span
                        className="absolute left-0 right-0 block h-[2px] bottom-[6px]
                                   bg-[linear-gradient(90deg,rgba(77,49,236,0)_0%,#4D31EC_20%,#4D31EC_80%,rgba(77,49,236,0)_100%)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* right content card */}
          <div
            className="flex flex-1 items-center gap-10 rounded-3xl border border-transparent px-7 py-16 shadow-sm md:flex-row
                       bg-[linear-gradient(135deg,#F1EEFF_0%,#F6F8FF_60%,#F9FBFF_100%)]"
          >
            {activeTab === "values" && (
              <>
                <div className="max-w-[780px] flex-1 text-left">
                  <T as="h3" variant="card36" className="text-left">
                    Human first always
                  </T>
                  <T as="p" variant="body16" lineHeightPx={27} className="mt-4 text-black">
                    {CORE_TABS[0].body}
                  </T>
                </div>
                <div className="shrink-0">
                  <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full ring-8 ring-white/60">
                    <Image src={"/Ellipse 87.png"} alt="Human first always" fill className="object-cover" />
                  </div>
                </div>
              </>
            )}

            {activeTab === "vision" && (
              <div className="max-w-[780px] flex-1 text-left">
                <T as="h3" variant="card36" className="text-left">
                  Make hiring simple, fair, and fast
                </T>
                <T as="p" variant="body16" lineHeightPx={27} className="mt-4 text-black">
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
                      className="object-cover object-[65%_50%]"
                    />
                  </div>
                </div>
                <div className="max-w-[780px] flex-1">
                  <T as="h3" variant="card36" className="text-left">
                    Hi, I’m <span className="text-[#4D31EC]">Cyril Thomas!</span>
                  </T>
                  <T as="p" variant="body16" lineHeightPx={27} className="mt-4 text-black">
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
        <Container className="relative py-[96px] text-white">
          <div className="grid min-h-[520px] grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <GlassPill iconColor="#FFFFFF" className="bg-white/10 px-4 text-white/95 ring-1 ring-inset ring-white/30">
                How we started
              </GlassPill>
              <T as="h2" variant="hero48" className="mt-6 text-white" autoLeading>
                Our journey
              </T>
            </div>

            <div className="lg:col-span-8">
              {/* progress rail + checkpoints */}
              <div className="mt-2">
                <div className="relative w-full">
                  <div className="h-[6px] w-full rounded-full bg-white/25" />
                  <div
                    style={
                      {
                    
                        "--progress": `${
                          JOURNEY_STEPS.length > 1
                            ? (jIndex / (JOURNEY_STEPS.length - 1)) * 100
                            : 0
                        }%`,
                      } as React.CSSProperties
                    }
                    className="absolute left-0 top-0 h-[6px] rounded-full bg-white transition-all duration-500 [width:var(--progress)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-between">
                    {JOURNEY_STEPS.map((_, i) => {
                      const reached = i <= jIndex;
                      return (
                        <span key={i} className="relative grid translate-y-[-2px] place-items-center">
                          <span
                            className={cx(
                              "h-4 w-4 rounded-full border-2 border-white/90 ring-2 transition-all",
                              reached
                                ? "bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]"
                                : "bg-transparent shadow-none"
                            )}
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 mb-6 flex items-center justify-between text-sm opacity-90">
                <div />
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90" aria-hidden>
                    <path d={JOURNEY_STEPS[jIndex].iconPath} />
                  </svg>
                  <T as="span" variant="body16" weight={500} lineHeightPx={22} className="text-white/90">
                    {JOURNEY_STEPS[jIndex].topLabel}
                  </T>
                </div>
                <T as="span" variant="body16" weight={500} lineHeightPx={22} className="opacity-90">
                  {JOURNEY_STEPS[jIndex].year}
                </T>
              </div>

              <div>
                <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={JOURNEY_STEPS[jIndex].iconPath} />
                  </svg>
                </div>

                <T as="h3" variant="card36" weight={540} className="text-white">
                  {JOURNEY_STEPS[jIndex].title}
                </T>
                <T as="p" variant="body16" lineHeightPx={26} className="mt-4 max-w-3xl text-white/95">
                  {JOURNEY_STEPS[jIndex].blurb}
                </T>
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

            <T as="p" variant="body16" weight={400} lineHeightPx={27} className="mt-5 text-left text-black">
              Rahi is the AI assistant built into WorkCrew.ai, designed to simplify, automate, and humanize recruitment.
              She helps companies screen thousands of resumes, conduct smart interviews, and assess culture-fit. From
              matching candidates to the right roles to running interviews and assessments, Rahi supports both sides of
              the hiring journey with precision and empathy.
            </T>
          </div>

          {/* concentric rings + avatar (blue ONLY inside central circle) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto h-[227px] w-[227px]">
              {/* removed the large outer blue fill */}
              <span className="absolute left-1/2 top-1/2 h-[208px] w-[208px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#C778F8]" aria-hidden />
              <span className="absolute left-1/2 top-1/2 h-[187px] w-[187px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#4D31EC]" aria-hidden />
              <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-8 ring-[#3C34D9]/20 bg-[#3C34D9]">
                <Image src="/Rah.png" alt="Rahi" fill className="object-cover object-[50%_25%]" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS + STATS */}
      <Section>
        <Container className="px-[50px]">
          <T as="h2" variant="hero48" weight={600} lineHeightPx={60} className="mb-12 text-center">
            Testimonials
          </T>
        </Container>

        {/* full-bleed scroller */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CarouselEndless items={TESTIMONIALS} cardW={410} cardH={215} />
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
                  Let’s talk. Our team can walk you through how it works, what it solves, and how fast you can get
                  started.
                </T>

                <div className="mt-6">
                  <Link href="/contact" className="inline-block" aria-label="Contact sales">
                    <LayeredPill
                      label="Contact sales"
                      size="md"
                      className={cx(
                        "text-[#4D31EC]",
                        "[--pill-middle-bg:#FFFFFF]",
                        "[--pill-shadow:0_1px_0_rgba(17,24,39,0.06)]",
                        "[&_svg]:text-[#4D31EC] [&_svg]:stroke-[#4D31EC]"
                      )}
                    />
                  </Link>
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

type Testimonial = { name: string; role: string; quote: string };

/* horizontally-looping testimonial cards with arrow controls.
   Arrows already call slideBy() which scrolls the track and normalizes the loop. */
function CarouselEndless({
  items,
  cardW = 410,
  cardH = 215,
}: {
  items: Testimonial[];
  cardW?: number;
  cardH?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const speedRef = React.useRef<number>(0.4);
  const pausedRef = React.useRef<boolean>(false);

  const LOOPED = React.useMemo(() => [...items, ...items, ...items], [items]);

  const normalizeScroll = React.useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const singleSetWidth = track.scrollWidth / 3;
    if (el.scrollLeft <= singleSetWidth * 0.2) el.scrollLeft += singleSetWidth;
    else if (el.scrollLeft >= singleSetWidth * 1.8) el.scrollLeft -= singleSetWidth;
  }, []);

  const step = React.useCallback(() => {
    const el = containerRef.current;
    if (!el || pausedRef.current) {
      frameRef.current = requestAnimationFrame(step);
      return;
    }
    el.scrollLeft += speedRef.current;
    normalizeScroll();
    frameRef.current = requestAnimationFrame(step);
  }, [normalizeScroll]);

  React.useEffect(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    el.scrollLeft = track.scrollWidth / 3;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!media.matches) frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [step]);

  const onMouseEnter = () => {
    pausedRef.current = true;
  };
  const onMouseLeave = () => {
    pausedRef.current = false;
  };

  const slideBy = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const delta = (dir === "left" ? -1 : 1) * Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(() => normalizeScroll(), 400);
  };

  return (
    <div
      className="relative"
      style={
        {
          "--card-w": `${cardW}px`,
          "--card-h": `${cardH}px`,
        } as React.CSSProperties
      }
    >
      <div
        ref={containerRef}
        className="overflow-x-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div ref={trackRef} className="flex w-max gap-6 px-6 pb-2 sm:px-10">
          {LOOPED.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="flex h-[var(--card-h)] w-[var(--card-w)] flex-col justify-between rounded-2xl border border-[#E7EBF2] bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#EEF2FF]">
                  <Image src="/Rah.png" alt="" width={40} height={40} className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[20px] font-semibold leading-[28px] text-[#111827]">
                    {t.name}
                  </div>
                  <div className="truncate text-sm text-[#6B7280]">{t.role}</div>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-[16px] leading-[24px] text-[#111827]">
                {t.quote}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <button
          onClick={() => slideBy("left")}
          aria-label="Slide testimonials left"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#E7EBF2] bg-white shadow-sm transition hover:bg-[#F7F9FF]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4D31EC" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          onClick={() => slideBy("right")}
          aria-label="Slide testimonials right"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#E7EBF2] bg-white shadow-sm transition hover:bg-[#F7F9FF]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4D31EC" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
