"use client";

import * as React from "react";

type Review = {
  name: string;
  title: string;  // role @ company
  quote: string;
  initials: string; // fallback avatar
};

const REVIEWS: Review[] = [
  {
    name: "Sarah Rajan",
    title: "Software Engineer at Google",
    quote:
      "Found my dream job within 2 weeks! The platform made it incredibly easy to connect with top-tier companies.",
    initials: "SR",
  },
  {
    name: "James Carter",
    title: "Product Manager at Amazon",
    quote:
      "The networking opportunities were invaluable, leading me to my ideal role within a month!",
    initials: "JC",
  },
  {
    name: "Carlos Mendez",
    title: "Data Analyst at Microsoft",
    quote:
      "Support throughout my journey was phenomenal; I secured an offer in just weeks!",
    initials: "CM",
  },
  {
    name: "Emily Chen",
    title: "UX Designer at Facebook",
    quote:
      "I never thought I'd land a position this quickly; the resources provided were top-notch!",
    initials: "EC",
  },
  {
    name: "James Lee",
    title: "ML Engineer at Google",
    quote:
      "The collaborative environment here has really elevated my skills and career!",
    initials: "JL",
  },
  {
    name: "Aisha Patel",
    title: "Frontend Developer at Amazon",
    quote:
      "Working on such innovative projects is a dream come true for me!",
    initials: "AP",
  },
  {
    name: "Robert Smith",
    title: "Data Analyst at Microsoft",
    quote:
      "The analytical tools and support make tackling complex data a breeze!",
    initials: "RS",
  },
  {
    name: "Sofia Martinez",
    title: "Graphic Designer at Adobe",
    quote:
      "I love the freedom to express creativity while working with industry leaders!",
    initials: "SM",
  },
];

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
      <span className="text-[14px] font-semibold tracking-wide">{initials}</span>
    </div>
  );
}

export default function ReviewsSection() {
  const [hovered, setHovered] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);

  const open = (idx: number) => setActive(idx);
  const close = () => setActive(null);
  const next = () => setActive((i) => (i === null ? 0 : (i + 1) % REVIEWS.length));
  const prev = () =>
    setActive((i) => (i === null ? 0 : (i - 1 + REVIEWS.length) % REVIEWS.length));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section
      className="w-full bg-[#4D31EC]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative mx-auto h-[711px] w-full max-w-[1280px] overflow-hidden px-6 py-10 md:px-10">
        {/* Title badge in the middle */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div
            className="rounded-full bg-white px-6 py-3 text-center text-[24px] font-medium leading-none text-[#4D31EC] md:text-[32px]"
            style={{ fontFamily: "var(--font-display)" }} // Schibsted Grotesk
          >
            What our users are saying
          </div>
        </div>

        {/* Grid of review cards */}
        <div
          className={`relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3`}
          aria-hidden={active !== null}
        >
          {REVIEWS.map((r, idx) => (
            <button
              key={idx}
              onClick={() => open(idx)}
              className={[
                // base card
                "group relative w-full rounded-[20px] border border-white/25 bg-white/10 p-5 text-left text-white backdrop-blur-sm",
                "transition-transform duration-300",
                "md:h-[215px] md:w-[410px]",
                hovered ? "animate-float" : "",
                active !== null ? "opacity-30 blur-[1px]" : "opacity-100",
              ].join(" ")}
              style={{ animationDelay: hovered ? `${(idx % 5) * 0.2}s` : "0s" }}
            >
              {/* subtle vertical divider effect like Figma (optional) */}
              <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-white/10" />

              <div className="flex items-center gap-3">
                <Avatar initials={r.initials} />
                <div>
                  <div
                    className="text-[18px] font-medium leading-[23px]"
                    style={{ fontFamily: "var(--font-sans)" }} // Archivo
                  >
                    {r.name}
                  </div>
                  <div
                    className="text-[12px] leading-[16px] opacity-80"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {r.title}
                  </div>
                </div>
              </div>

              <p
                className="mt-4 line-clamp-4 text-[16px] leading-[23px] opacity-90"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                “{r.quote}”
              </p>

              {/* hover lift */}
              <div className="pointer-events-none absolute inset-0 rounded-[20px] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]" />
            </button>
          ))}
        </div>

        {/* Focus overlay */}
        {active !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <div className="relative w-full max-w-[720px] rounded-3xl border border-white/20 bg-[#3C25D1] p-6 text-white shadow-2xl">
              {/* Close */}
              <button
                onClick={close}
                className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30"
              >
                ✕
              </button>

              {/* Content */}
              <div className="flex items-center gap-3">
                <Avatar initials={REVIEWS[active].initials} />
                <div>
                  <div
                    className="text-[20px] font-medium leading-[23px]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {REVIEWS[active].name}
                  </div>
                  <div
                    className="text-[13px] leading-[18px] opacity-80"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {REVIEWS[active].title}
                  </div>
                </div>
              </div>

              <p
                className="mt-5 text-[18px] leading-[26px]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                “{REVIEWS[active].quote}”
              </p>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={prev}
                  className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
                >
                  ← Prev
                </button>
                <div className="text-xs opacity-80">
                  {active + 1} / {REVIEWS.length}
                </div>
                <button
                  onClick={next}
                  className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* component-scoped keyframes */}
      <style jsx>{`
        @keyframes floatY {
          0%   { transform: translateY(0px) }
          50%  { transform: translateY(-8px) }
          100% { transform: translateY(0px) }
        }
        .animate-float {
          animation: floatY 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
