// PATH: app/about/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Section, Container, Button } from "../../workcrew-ui/components/primitives";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";

/* ---------- Pill (140×38) with bolt icon ---------- */
const Pill = ({ label }: { label: string }) => (
  <span
    className="inline-flex items-center justify-center rounded-full bg-[#E9ECFF] text-[#5E6AD2]"
    style={{ width: 140, height: 38 }}
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="mr-2">
      <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
    </svg>
    <span className="text-xs font-medium">{label}</span>
  </span>
);

const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

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

/* ---------- Journey steps (auto-plays) ---------- */
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

/* ---------- Testimonials data ---------- */
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
  const active = CORE_TABS.find((t) => t.id === activeTab)!;

  // Journey auto-advance (2s per slide)
  const [jIndex, setJIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setJIndex((i) => (i + 1) % JOURNEY_STEPS.length), 2000);
    return () => clearInterval(id);
  }, []);

  // Testimonials pagination (2 cards visible)
  const [tIndex, setTIndex] = React.useState(0);
  const total = TESTIMONIALS.length;
  const visibleCards = [TESTIMONIALS[tIndex % total], TESTIMONIALS[(tIndex + 1) % total]];
  const prevT = () => setTIndex((i) => (i - 1 + total) % total);
  const nextT = () => setTIndex((i) => (i + 1) % total);

  return (
    <main className="relative min-h-screen bg-white">
      <NewNavbar />

      {/* =============== HERO =============== */}
      <Section className="relative overflow-hidden">
        <Container className="relative z-10 pt-[96px] pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center mb-6">
              <Pill label="Who are we?" />
            </div>

            <h1
              className="font-medium"
              style={{
                fontFamily: "var(--font-schibsted)",
                fontSize: 48,
                lineHeight: "62px",
                letterSpacing: "0em",
              }}
            >
              Your <span className="text-[#5E6AD2]">one-stop AI</span>
              <br />
              <span className="text-[#5E6AD2]">recruitment</span> <span className="font-normal">platform</span>
            </h1>

            <p
              className="mt-5 text-[#2D3340]/85"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 400,
                fontSize: 20,
                lineHeight: "27px",
                letterSpacing: "0.03em",
              }}
            >
              WorkCrew.ai is more than a hiring tool. It&apos;s an AI-powered recruitment platform that helps companies
              find and hire talent efficiently. We simplify the recruitment journey with one intelligent, human-first
              platform.
            </p>

            {/* Book a demo — login-style pill (no circle behind arrow) */}
            <div className="mt-8">
              <Link href="/contact" className="inline-block">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full text-white font-semibold"
                  style={{
                    background: "linear-gradient(90deg, #6E45FF 0%, #4D31EC 100%)",
                    height: 48,
                    padding: "0 28px",
                    boxShadow: "0 6px 20px rgba(77,49,236,0.30)",
                    transition: "all .25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(77,49,236,0.40)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(77,49,236,0.30)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                  Book a demo
                </button>
              </Link>
            </div>
          </div>
        </Container>

        {/* Edge visuals */}
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

      {/* =============== CONVERSATIONS =============== */}
      <Section>
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <Pill label="How we started" />
            <h2 className="mt-6 font-medium" style={{ fontFamily: "var(--font-schibsted)", fontSize: 48, lineHeight: "normal", letterSpacing: "0.01em" }}>
              Built through conversations
            </h2>
            <p className="mt-5 text-[#454B54]" style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: 16, lineHeight: "27px", letterSpacing: "0.03em" }}>
              WorkCrew.ai grew out of countless conversations with people who live and breathe hiring. They shared their
              frustrations, their ideas, and their hopes for something better.
              <br />
              <br />
              We owe much of our vision to the incredible HRs and recruiters who helped us see the bigger picture. Their
              experiences shaped our features, their honesty shaped our purpose, and their belief in something better
              continues to inspire us as we grow. These are the people behind the idea, the ones who made WorkCrew.ai
              possible.
            </p>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ width: 386, height: 381 }}>
              <Image src="/about-team.png" alt="WorkCrew team — conversations" fill className="object-cover" />
            </div>
          </div>
        </Container>
      </Section>

      {/* =============== CORE VALUES (tabs) — parallel layout =============== */}
      <Section className="pt-2">
        <Container className="flex flex-col lg:flex-row gap-12 px-[80px] items-start justify-between">
          {/* Tabs (fixed width) */}
          <div className="w-full max-w-[300px] space-y-6">
            {CORE_TABS.map((t) => {
              const activeNow = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cx("w-full text-left text-base transition relative", activeNow ? "text-[#4D31EC] font-semibold" : "text-[#A3A9B5]")}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
                    </svg>
                    {t.title}
                  </span>
                  {activeNow && (
                    <span
                      className="block absolute left-0 right-0"
                      style={{
                        height: 2,
                        bottom: -10,
                        background: "linear-gradient(90deg, rgba(77,49,236,0) 0%, #4D31EC 20%, #4D31EC 80%, rgba(77,49,236,0) 100%)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content card (flex-1) */}
          <div
            className="flex-1 rounded-3xl border border-transparent shadow-sm flex flex-col md:flex-row items-center gap-10 px-7 py-16"
            style={{ background: "linear-gradient(135deg, #F1EEFF 0%, #F6F8FF 60%, #F9FBFF 100%)" }}
          >
            {activeTab === "values" && (
              <>
                <div className="flex-1 max-w-[780px]">
                  <h3 className="text-[40px] leading-tight font-semibold">
                    <span className="text-[#4D31EC]">{active.headline.split(" ")[0]}</span>{" "}
                    {active.headline.split(" ").slice(1).join(" ")}
                  </h3>
                  <p className="mt-4 text-[#222] text-lg leading-8">{active.body}</p>
                </div>
                <div className="shrink-0">
                  <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden ring-8 ring-white/60">
                    <Image src={active.img} alt="" fill className="object-cover" />
                  </div>
                </div>
              </>
            )}

            {activeTab === "vision" && (
              <div className="w-full text-center">
                <h3 className="text-[40px] leading-tight font-semibold">
                  <span className="text-[#4D31EC]">{active.headline.split(" ")[0]}</span>{" "}
                  {active.headline.split(" ").slice(1).join(" ")}
                </h3>
                <p className="mt-4 text-[#222] text-lg leading-8 mx-auto max-w-2xl">{active.body}</p>
              </div>
            )}

            {activeTab === "founder" && (
              <>
                <div className="shrink-0">
                  <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden ring-8 ring-white/60">
                    <Image src="/cyril-thomas.png" alt="Cyril Thomas" fill className="object-cover" />
                  </div>
                </div>
                <div className="flex-1 max-w-[780px]">
                  <h3 className="text-[40px] leading-tight font-semibold">
                    <span className="text-[#4D31EC]">{active.headline}</span>
                  </h3>
                  <p className="mt-4 text-[#222] text-lg leading-8">{active.body}</p>
                </div>
              </>
            )}
          </div>
        </Container>
      </Section>

      {/* =============== OUR JOURNEY (auto-plays) =============== */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: "#4D31EC" }} />
        <Container className="relative text-white py-[96px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[520px]">
            <div className="lg:col-span-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 h-10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                  <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
                </svg>
                How we started
              </span>
              <h2 className="mt-6 text-5xl font-semibold tracking-tight">Our journey</h2>
            </div>

            <div className="lg:col-span-8">
              <div className="mb-12">
                <div className="flex items-center justify-between text-sm opacity-90">
                  <div />
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                      <path d={JOURNEY_STEPS[jIndex].iconPath} />
                    </svg>
                    {JOURNEY_STEPS[jIndex].topLabel}
                  </div>
                  <div className="opacity-90">{JOURNEY_STEPS[jIndex].year}</div>
                </div>

                <div className="relative mt-3">
                  <div className="h-1 w-full bg-white/30 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    {JOURNEY_STEPS.map((_, i) => (
                      <span key={i} className="h-3 w-3 rounded-full bg-white" style={{ opacity: i <= jIndex ? 1 : 0.6 }} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={JOURNEY_STEPS[jIndex].iconPath} />
                  </svg>
                </div>

                <h3 className="text-4xl font-semibold">{JOURNEY_STEPS[jIndex].title}</h3>
                <p className="mt-4 max-w-3xl text-white/95 text-lg leading-8">{JOURNEY_STEPS[jIndex].blurb}</p>

                <div className="mt-10 mb-[96px] flex gap-6">
                  {JOURNEY_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-white/40"
                      style={{
                        width: 140,
                        opacity: i === jIndex ? 1 : 0.6,
                        boxShadow: i === jIndex ? "0 0 0 2px rgba(255,255,255,.35) inset" : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =============== RAHI (spec + animated rings) =============== */}
      <Section>
        <Container className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
          <div className="lg:col-span-7">
            <span
              className="inline-flex items-center justify-center rounded-full bg-[#E9ECFF] text-[#5E6AD2] mb-6"
              style={{ width: 157, height: 38 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
              </svg>
              <span className="text-xs font-medium">How we started</span>
            </span>

            <h2
              className="font-medium"
              style={{
                fontFamily: "var(--font-schibsted)",
                fontSize: 48,
                lineHeight: "normal",
                letterSpacing: "0.01em",
              }}
            >
              Say Hi to <span className="text-[#4D31EC]">Rahi</span>!
            </h2>

            <p
              className="mt-5 text-[#2D3340]/90"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: "27px",
                letterSpacing: "0.03em",
              }}
            >
              Rahi is the AI assistant built into WorkCrew.ai, designed to simplify, automate, and
              humanize recruitment. She helps companies screen thousands of resumes, conduct smart
              interviews, and assess culture-fit. From matching candidates to the right roles to running
              interviews and assessments, Rahi supports both sides of the hiring journey with precision
              and empathy.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto" style={{ width: 227, height: 227 }}>
              <span className="absolute inset-0 rounded-full border animate-spin-slower" style={{ borderColor: "#FFA1EE", borderWidth: 4 }} aria-hidden />
              <span
                className="absolute rounded-full border animate-pulse-ring"
                style={{
                  width: 208,
                  height: 208,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  borderColor: "#C778F8",
                  borderWidth: 4,
                }}
                aria-hidden
              />
              <span
                className="absolute rounded-full border animate-spin-slow"
                style={{
                  width: 187,
                  height: 187,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  borderColor: "#4D31EC",
                  borderWidth: 4,
                }}
                aria-hidden
              />
              <div
                className="absolute overflow-hidden rounded-full ring-8"
                style={{
                  width: 159,
                  height: 159,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  ringColor: "#E9ECFF",
                } as any}
              >
                <Image src="/Rah.png" alt="Rahi" fill className="object-cover" />
              </div>
            </div>
          </div>
        </Container>

        <style jsx>{`
          @keyframes spin-slower {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes spin-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to   { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          @keyframes pulse-ring {
            0%   { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
            60%  { transform: translate(-50%, -50%) scale(1.04); opacity: .9; }
            100% { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
          }
          .animate-spin-slower { animation: spin-slower 18s linear infinite; }
          .animate-spin-slow   { animation: spin-slow 12s linear infinite; }
          .animate-pulse-ring  { animation: pulse-ring 2.6s ease-in-out infinite; }
        `}</style>
      </Section>

      {/* =============== TESTIMONIALS (2-card grid + arrows) =============== */}
      <Section>
        <Container>
          <h2 className="text-center font-semibold mb-12" style={{ fontFamily: "var(--font-schibsted)", fontSize: 48, lineHeight: "60px" }}>
            Testimonials
          </h2>

          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {visibleCards.map((t, i) => (
                <article
                  key={`${t.name}-${i}`}
                  className="w-full max-w-[520px] rounded-2xl border border-[#E7EBF2] bg-white p-8 shadow-[0_2px_8px_rgba(17,24,39,0.04)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#EEF2FF] grid place-items-center overflow-hidden">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#5E6AD2" aria-hidden>
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                      </svg>
                    </div>

                    <div>
                      <div className="text-[20px] leading-[28px] font-semibold text-[#111827]">{t.name}</div>
                      <div className="text-sm text-[#6B7280]">{t.role}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#111827]">
                      <path d="M7.17 6A4.17 4.17 0 0 0 3 10.17V18h6v-8H6.5A3.5 3.5 0 0 1 10 6H7.17zm9 0A4.17 4.17 0 0 0 12 10.17V18h6v-8h-2.5A3.5 3.5 0 0 1 19 6h-2.83z" />
                    </svg>

                    <p className="mt-2 text-[16px] leading-[26px] text-[#111827]/85">
                      {t.quote}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                onClick={prevT}
                className="h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] hover:bg-[#F5F7FF] transition"
                aria-label="Previous testimonials"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={nextT}
                className="h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] hover:bg-[#F5F7FF] transition"
                aria-label="Next testimonials"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

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

      {/* =============== CTA (Curious how…) =============== */}
      <Section className="pb-20">
        <div className="mx-[100px]">
          <div className="relative overflow-hidden rounded-3xl" style={{ background: "#4D31EC" }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 lg:p-12">
              <div className="lg:col-span-8">
                <h3
                  style={{
                    fontFamily: "var(--font-schibsted)",
                    fontWeight: 500,
                    fontSize: 32,
                    lineHeight: "42px",
                    letterSpacing: "0.01em",
                    color: "#FFFFFF",
                  }}
                >
                  Curious how WorkCrew.ai can fit into your hiring workflow?
                </h3>

                <p className="mt-3 text-white/90" style={{ fontFamily: "var(--font-archivo)" }}>
                  Let’s talk. Our team can walk you through how it works, what it solves, and
                  how fast you can get started.
                </p>

                {/* Concentric pill button */}
                <div className="mt-6">
                  <Link href="/contact" className="inline-block" aria-label="Contact sales">
                    <span className="relative inline-flex rounded-full p-[3px]" style={{ background: "rgba(196,211,239,0.43)" }}>
                      <span className="inline-flex items-center gap-3 rounded-full bg-white h-[48px] px-5 shadow-[0_1px_0_rgba(17,24,39,0.06)]">
                        <span className="grid place-items-center h-[28px] w-[28px] rounded-full" style={{ background: "#E7E3FF" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4D31EC" strokeWidth="2">
                            <path d="M7 17L17 7M9 7h8v8" />
                          </svg>
                        </span>
                        <span className="text-[#4D31EC] font-medium" style={{ fontFamily: "var(--font-archivo)" }}>
                          Contact sales
                        </span>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right image (save as /public/cta-lady.png) */}
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
        </div>
      </Section>

      <NewFooter />
    </main>
  );
}
