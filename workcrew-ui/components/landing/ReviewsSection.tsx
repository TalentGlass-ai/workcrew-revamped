"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

type Review = {
  name: string;
  title: string;
  company: string;
  quote: string;
  avatar?: string;
};

const ROW1: Review[] = [
  { name: "Ananya Gupta", title: "Software Engineer", company: "Google", quote: "Found my dream job within 2 weeks! Matching was super sharp and human.", avatar: "/avatars/1.png" },
  { name: "Rohan Mehta", title: "Product Manager", company: "Amazon", quote: "The networking opportunities were invaluable—got my offer in a month.", avatar: "/avatars/2.png" },
  { name: "Maya Iyer", title: "Data Scientist", company: "Microsoft", quote: "Clear process, fast feedback, and real teams. Loved the experience!", avatar: "/avatars/3.png" },
  { name: "Ishita Rao", title: "UX Designer", company: "Meta", quote: "Resources and guidance were top-notch. Interview felt effortless.", avatar: "/avatars/4.png" },
];

const ROW2: Review[] = [
  { name: "Arjun Nair", title: "Frontend Developer", company: "Swiggy", quote: "The portfolio tips and role matches were insanely accurate.", avatar: "/avatars/5.png" },
  { name: "Rahul Sharma", title: "ML Engineer", company: "NVIDIA", quote: "Hands-on projects aligned perfectly with what teams wanted.", avatar: "/avatars/6.png" },
  { name: "Sara Fernandes", title: "Full-Stack Engineer", company: "Atlassian", quote: "A transparent, fair process—finally feels built for candidates.", avatar: "/avatars/7.png" },
  { name: "Aarushi Jain", title: "Visual Designer", company: "Adobe", quote: "Loved how fast I could talk to the actual team I’d work with.", avatar: "/avatars/8.png" },
];

const ROW3: Review[] = [
  { name: "Priya Menon", title: "Content Designer", company: "Canva", quote: "Real roles, real teams—no spam. I was onboarded in days.", avatar: "/avatars/9.png" },
  { name: "Kabir Kapoor", title: "iOS Engineer", company: "Apple", quote: "Signal over noise. The best recruiting experience I’ve had.", avatar: "/avatars/10.png" },
  { name: "Ananya Gupta", title: "Software Engineer", company: "Google", quote: "Found my dream job within 2 weeks! Matching was super sharp and human.", avatar: "/avatars/1.png" },
  { name: "Rohan Mehta", title: "Product Manager", company: "Amazon", quote: "The networking opportunities were invaluable—got my offer in a month.", avatar: "/avatars/2.png" },
];

export default function ReviewsSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 15%"] });

  // Slower parallax drift
  const x1 = useTransform(scrollYProgress, [0, 1], ["-10%", "-25%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const x3 = useTransform(scrollYProgress, [0, 1], ["-10%", "-30%"]);

  return (
    <section
      ref={ref}
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden text-white"
      style={{
        paddingTop: 40,
        paddingBottom: 40,
        background: "linear-gradient(180deg,#4D31EC 0%,#4a2fe9 50%,#462ae1 100%)",
      }}
    >
      {/* Center headline capsule */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 765,
            height: 304,
            background: `
              linear-gradient(
                90deg,
                rgba(77,49,236,0) 0%,
                rgba(77,49,236,1) 30%,
                rgba(77,49,236,1) 70%,
                rgba(77,49,236,0) 100%
              )
            `,
          }}
        >
          <h2
            className="text-center"
            style={{
              fontFamily: "var(--font-schibsted,'Schibsted Grotesk',ui-sans-serif)",
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: "0.01em",
              lineHeight: 1.2,
              color: "#ffffff",
            }}
          >
            What our users are saying
          </h2>
        </div>
      </div>

      {/* Rows (more breathing room) */}
      <div className="relative mx-auto mt-8 grid gap-y-[28px] px-6 md:px-12">
        <motion.div style={{ x: x1 }} className="flex w-[220%] gap-16">
          {repeatToFill(ROW1, 10).map((r, i) => (
            <ReviewCard key={`r1-${i}`} r={r} />
          ))}
        </motion.div>
        <motion.div style={{ x: x2 }} className="flex w-[220%] gap-16">
          {repeatToFill(ROW2, 10).map((r, i) => (
            <ReviewCard key={`r2-${i}`} r={r} />
          ))}
        </motion.div>
        <motion.div style={{ x: x3 }} className="flex w-[220%] gap-16">
          {repeatToFill(ROW3, 10).map((r, i) => (
            <ReviewCard key={`r3-${i}`} r={r} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* Transparent review card with thin white border */
function ReviewCard({ r }: { r: Review }) {
  return (
    <article
      className="relative shrink-0"
      style={{
        width: 410,
        height: 215,
        borderRadius: 24,
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.40)",
        padding: 24,
      }}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className="relative overflow-hidden"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.40)",
          }}
        >
          {r.avatar && (
            <Image src={r.avatar} alt={r.name} fill sizes="40px" className="object-cover" />
          )}
        </div>
        <div className="leading-none">
          <div
            style={{
              fontFamily: "var(--font-archivo,Archivo,ui-sans-serif)",
              fontWeight: 500,
              fontSize: 24,
              lineHeight: "23px",
            }}
          >
            {r.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-archivo,Archivo,ui-sans-serif)",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "23px",
              opacity: 0.95,
            }}
          >
            {r.title} at {r.company}
          </div>
        </div>
      </div>
      <blockquote
        style={{
          fontFamily: "var(--font-archivo,Archivo,ui-sans-serif)",
          fontWeight: 400,
          fontSize: 16,
          lineHeight: "23px",
        }}
      >
        {r.quote}
      </blockquote>
    </article>
  );
}

/* helper */
function repeatToFill<T>(arr: T[], min: number): T[] {
  const out: T[] = [];
  while (out.length < min) out.push(...arr);
  return out.slice(0, min);
}
