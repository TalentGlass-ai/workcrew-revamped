// // PATH: app/about/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Section, Container } from "../../workcrew-ui/components/primitives";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";
import GlassPill from "../../workcrew-ui/components/primitives/tags/GlassPill";
import LayeredPill from "../../workcrew-ui/components/primitives/buttons/LayeredPill";
import T from "../../workcrew-ui/components/primitives/Typography"; // ← reuse typography

// helper
const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

// simple bolt svg
const Bolt = ({ className = "", fill = "#4D31EC", size = 16 }: { className?: string; fill?: string; size?: number }) => (
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

  const [jIndex, setJIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setJIndex((i) => (i + 1) % JOURNEY_STEPS.length), 2000);
    return () => clearInterval(id);
  }, []);

  // conversations carousel
  const convoImages = React.useMemo(
    () => ["/about-team.png", "/about-team-2.png", "/about-team-3.png"],
    []
  );
  const [convoIdx, setConvoIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setConvoIdx((i) => (i + 1) % convoImages.length), 5000);
    return () => clearInterval(id);
  }, [convoImages.length]);

  return (
    <main className="relative min-h-screen bg-white">
      <NewNavbar />

      {/* HERO */}
      <Section className="relative overflow-hidden">
        <Container className="relative z-10 pt-[96px] pb-20 px-[50px]">
          <div className="mx-auto w-full text-center flex flex-col items-center">
            <div className="mb-4">
              <GlassPill className="px-4">who are we ?</GlassPill>
            </div>

            <div className="px-2">
              {/* Two centered lines at 52px (Schibsted, -1% ls, 66px lh) */}
              <T
                as="h1"
                variant="hero48"
                className="mx-auto font-medium text-center text-black"
                trackingPct={-1}
                lineHeightPx={66}
              >
                <span className="block text-[52px]">
                  <span className="text-black">Your </span>
                  <span className="text-[#4D31EC]">one-stop AI</span>
                </span>
                <span className="block text-[52px] text-black">recruitment platform</span>
              </T>

              <T
                as="p"
                variant="sub20"
                weight={400}
                lineHeightPx={27}
                className="mt-4 text-center mx-auto text-black max-w-[820px]"
              >
                WorkCrew.ai is more than a hiring tool. It&apos;s an AI-powered recruitment platform that helps
                companies find and hire talent efficiently. We simplify the recruitment journey with one intelligent,
                human-first platform.
              </T>
            </div>

            {/* Book demo — blue pill, white text + arrow */}
            <div className="mt-8">
              <Link href="/contact" className="inline-block" aria-label="Book demo">
                <span
                  className={cx(
                    "inline-flex items-center gap-3 rounded-full h-[56px] px-8",
                    "bg-[#4D31EC] text-white font-semibold",
                    "hover:bg-[#3a27c5] transition-all duration-200 ease-in-out",
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

        {/* background decor */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute z-20 drop-shadow-2xl" style={{ top: "calc(10% - 10px)", left: "-280px", transform: "rotate(30deg)" }}>
            <Image src="/hero-right.png" alt="Left hero image" width={435} height={480} priority />
          </div>
          <div className="absolute z-10 drop-shadow-2xl" style={{ top: "8%", right: "-300px", transform: "rotate(-30deg)", opacity: 0.98 }}>
            <Image src="/hero-right.png" alt="Right hero image" width={435} height={480} priority />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(#EEF1FF 1px, transparent 1px), linear-gradient(90deg, #EEF1FF 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </Section>

      {/* CONVERSATIONS */}
      <Section>
        <Container className="px-[50px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
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
              WorkCrew.ai grew out of countless conversations with people who live and breathe hiring. They shared their
              frustrations, their ideas, and their hopes for something better.
              <br />
              <br />
              We owe much of our vision to the incredible HRs and recruiters who helped us see the bigger picture. Their
              experiences shaped our features, their honesty shaped our purpose, and their belief in something better
              continues to inspire us as we grow. These are the people behind the idea, the ones who made WorkCrew.ai
              possible.
            </T>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center">
            <div
              className="relative rounded-3xl overflow-hidden select-none"
              style={{ width: 386, height: 381 }}
              aria-roledescription="carousel"
            >
              <div
                className="absolute inset-0 flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${convoIdx * 100}%)`, width: `${convoImages.length * 100}%` }}
              >
                {convoImages.map((src, i) => (
                  <div key={i} className="relative h-full" style={{ width: `${100 / convoImages.length}%` }}>
                    <Image src={src} alt={`Team photo ${i + 1}`} fill className="object-cover" priority={i === 0} />
                  </div>
                ))}
              </div>
            </div>

            {/* dots under image */}
            <div className="mt-3 flex items-center gap-2">
              {convoImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setConvoIdx(i)}
                  className="h-[6px] rounded-full transition-all"
                  style={{
                    width: i === convoIdx ? 42 : 10,
                    background: i === convoIdx ? "#6D5EF0" : "rgba(109,94,240,0.35)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CORE VALUES */}
      <Section className="pt-2">
        <Container className="px-[50px] flex flex-col lg:flex-row gap-12 items-stretch justify-between">
          {/* left tabs */}
          <div className="w-full max-w-[300px]">
            <div className="grid grid-rows-3 h-full content-between gap-0">
              {CORE_TABS.map((t) => {
                const activeNow = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className="w-full text-left relative py-4"
                  >
                    <span className="inline-flex items-center gap-2">
                      {/* show bolt ONLY for the active option, in #4D31EC */}
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
                        className="block absolute left-0 right-0"
                        style={{
                          height: 2,
                          bottom: 6,
                          background:
                            "linear-gradient(90deg, rgba(77,49,236,0) 0%, #4D31EC 20%, #4D31EC 80%, rgba(77,49,236,0) 100%)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* right card */}
          <div
            className="flex-1 rounded-3xl border border-transparent shadow-sm flex flex-col md:flex-row items-center gap-10 px-7 py-16"
            style={{ background: "linear-gradient(135deg, #F1EEFF 0%, #F6F8FF 60%, #F9FBFF 100%)" }}
          >
            {activeTab === "values" && (
              <>
                <div className="flex-1 max-w-[780px] text-left">
                  <T as="h3" variant="card36" className="text-left">
                    Human first always
                  </T>
                  <T as="p" variant="body16" lineHeightPx={27} className="mt-4 text-black">
                    {CORE_TABS[0].body}
                  </T>
                </div>
                <div className="shrink-0">
                  <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden ring-8 ring-white/60">
                    <Image src={"/Ellipse 87.png"} alt="Human first always" fill className="object-cover" />
                  </div>
                </div>
              </>
            )}

            {activeTab === "vision" && (
              <div className="flex-1 max-w-[780px] text-left">
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
                  <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden ring-8 ring-white/60">
                    <Image
                      src="/cyril.png"
                      alt="Cyril Thomas"
                      fill
                      className="object-cover"
                      style={{ objectPosition: "65% 50%" }}
                    />
                  </div>
                </div>
                <div className="flex-1 max-w-[780px]">
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
      <section className="relative">
        <div className="absolute inset-0" style={{ background: "#4D31EC" }} />
        <Container className="relative text-white py-[96px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[520px]">
            <div className="lg:col-span-4">
              {/* white-on-purple pill */}
              <GlassPill iconColor="#FFFFFF" className="border-white/30 bg-white/10 text-white/95 px-4">
                How we started
              </GlassPill>
              <T as="h2" variant="hero48" className="mt-6 text-white" autoLeading>
                Our journey
              </T>
            </div>

            <div className="lg:col-span-8">
              {/* traversing check-post line */}
              <div className="mt-2">
                <div className="relative w-full">
                  <div className="h-[6px] w-full rounded-full bg-white/25" />
                  <div
                    className="absolute top-0 left-0 h-[6px] rounded-full bg-white transition-all duration-500"
                    style={{
                      width:
                        JOURNEY_STEPS.length > 1
                          ? `${(jIndex / (JOURNEY_STEPS.length - 1)) * 100}%`
                          : "0%",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between">
                    {JOURNEY_STEPS.map((_, i) => {
                      const reached = i <= jIndex;
                      return (
                        <span key={i} className="relative grid place-items-center" style={{ transform: "translateY(-2px)" }}>
                          <span
                            className="h-4 w-4 rounded-full ring-2 transition-all"
                            style={{
                              background: reached ? "#FFFFFF" : "transparent",
                              boxShadow: reached ? "0 0 0 3px rgba(255,255,255,0.25)" : "none",
                              border: "2px solid rgba(255,255,255,0.9)",
                            } as React.CSSProperties}
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

      {/* RAHI — add 100px gap above & below */}
      <Section className="my-[100px]">
        <Container className="px-[50px] grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
          <div className="lg:col-span-7">
            <GlassPill className="px-4 mb-6">How we started</GlassPill>
            <T as="h2" variant="hero48" className="text-left">
              Say Hi to <span className="text-[#4D31EC]">Rahi</span>!
            </T>

            {/* black paragraph per request */}
            <T as="p" variant="body16" weight={400} lineHeightPx={27} className="mt-5 text-left text-black">
              Rahi is the AI assistant built into WorkCrew.ai, designed to simplify, automate, and humanize recruitment.
              She helps companies screen thousands of resumes, conduct smart interviews, and assess culture-fit. From
              matching candidates to the right roles to running interviews and assessments, Rahi supports both sides of
              the hiring journey with precision and empathy.
            </T>
          </div>

          <div className="lg:col-span-5">
            {/* blue background + slightly smaller image so face is fully visible */}
            <div className="relative mx-auto" style={{ width: 227, height: 227 }}>
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "#4D31EC", opacity: 0.12 }}
                aria-hidden
              />
              <span
                className="absolute rounded-full border"
                style={{
                  width: 208, height: 208, left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  borderColor: "#C778F8", borderWidth: 4,
                }}
                aria-hidden
              />
              <span
                className="absolute rounded-full border"
                style={{
                  width: 187, height: 187, left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  borderColor: "#4D31EC", borderWidth: 4,
                }}
                aria-hidden
              />
              <div
                className="absolute overflow-hidden rounded-full ring-8 bg-[#3C34D9]"
                style={{
                  width: 150, height: 150, left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Image
                  src="/Rah.png"
                  alt="Rahi"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "50% 25%" }}
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS */}
      <Section>
        <Container className="px-[50px]">
          <T as="h2" variant="hero48" weight={600} lineHeightPx={60} className="mb-12 text-center">
            Testimonials
          </T>
        </Container>

        {/* Full-bleed carousel (edge-to-edge) */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <CarouselEndless items={TESTIMONIALS} cardW={410} cardH={215} />
        </div>

        {/* Stats back inside container */}
        <Container className="px-[50px]">
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#F2F4FF] to-[#F9FAFF] p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[28px] leading-[32px] font-semibold text-[#111827]">{s.value}</div>
                <div className="text-sm text-[#7A8595]">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="pb-20">
        <Container className="px-[50px]">
          <div className="relative overflow-hidden rounded-3xl" style={{ background: "#4D31EC" }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 lg:p-12">
              <div className="lg:col-span-8">
                <T as="h3" variant="sub20" className="text-white" lineHeightPx={42} trackingPct={1} weight={500}>
                  Curious how WorkCrew.ai can fit into your hiring workflow?
                </T>

                <T as="p" variant="body16" className="mt-3 text-white/90">
                  Let’s talk. Our team can walk you through how it works, what it solves, and
                  how fast you can get started.
                </T>

                <div className="mt-6">
                  <Link href="/contact" className="inline-block" aria-label="Contact sales">
                    {/* White button with blue text (4D31EC) */}
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

              <div className="lg:col-span-4 relative">
                <div className="relative ml-auto h-[267px] w-[220px]">
                  <Image
                    src="/cta-lady.png"
                    alt="Friendly lady from the team waving hello"
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

/** =========================
 *  Endless Carousel Component
 *  ========================= */
type Testimonial = { name: string; role: string; quote: string };

function CarouselEndless({ items, cardW = 410, cardH = 215 }: { items: Testimonial[]; cardW?: number; cardH?: number }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const speedRef = React.useRef<number>(0.4); // px per frame
  const pausedRef = React.useRef<boolean>(false);

  // Duplicate items to achieve a seamless loop
  const LOOPED = React.useMemo(() => [...items, ...items, ...items], [items]);

  // Normalize scroll position into the middle copy to keep it stable
  const normalizeScroll = React.useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const singleSetWidth = track.scrollWidth / 3; // since LOOPED has 3 copies
    if (el.scrollLeft <= singleSetWidth * 0.2) {
      el.scrollLeft += singleSetWidth;
    } else if (el.scrollLeft >= singleSetWidth * 1.8) {
      el.scrollLeft -= singleSetWidth;
    }
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
    if (!media.matches) {
      frameRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [step]);

  const onMouseEnter = () => { pausedRef.current = true; };
  const onMouseLeave = () => { pausedRef.current = false; };

  const slideBy = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const delta = (dir === "left" ? -1 : 1) * Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(() => normalizeScroll(), 400);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-x-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div ref={trackRef} className="flex gap-6 w-max px-6 sm:px-10" style={{ paddingBottom: 8 }}>
          {LOOPED.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="rounded-2xl border border-[#E7EBF2] bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.04)] flex flex-col justify-between"
              style={{ width: cardW, height: cardH }}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-[#EEF2FF] flex-shrink-0">
                  <Image src="/Rah.png" alt="" width={40} height={40} className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="text-[20px] leading-[28px] font-semibold text-[#111827] truncate">{t.name}</div>
                  <div className="text-sm text-[#6B7280] truncate">{t.role}</div>
                </div>
              </div>

              <p className="mt-3 text-[16px] leading-[24px] text-[#111827] line-clamp-3">{t.quote}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <button
          onClick={() => slideBy("left")}
          aria-label="Slide testimonials left"
          className="h-10 w-10 grid place-items-center rounded-full border border-[#E7EBF2] bg-white shadow-sm hover:bg-[#F7F9FF] transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4D31EC" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          onClick={() => slideBy("right")}
          aria-label="Slide testimonials right"
          className="h-10 w-10 grid place-items-center rounded-full border border-[#E7EBF2] bg-white shadow-sm hover:bg-[#F7F9FF] transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4D31EC" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
