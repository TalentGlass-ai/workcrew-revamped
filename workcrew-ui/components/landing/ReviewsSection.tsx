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

  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"],
  });

  
  const x1 = useTransform(scrollYProgress, [0, 1], ["-10%", "-25%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const x3 = useTransform(scrollYProgress, [0, 1], ["-10%", "-30%"]);

  return (
  
    <section
      ref={ref}
      className="reviews-section relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[linear-gradient(180deg,#4D31EC_0%,#4a2fe9_50%,#462ae1_100%)] !my-0 !py-0 text-white"
    >
      {/* internal vertical breathing */}
      <div className="py-12 md:py-16">
        {/* Centered halo + headline */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-[304px] w-[765px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(77,49,236,1)_0%,rgba(77,49,236,1)_35%,rgba(77,49,236,0.75)_55%,rgba(77,49,236,0.4)_70%,rgba(77,49,236,0)_100%)] shadow-[0_0_100px_rgba(105,81,242,0.65)]">
            <h2 className="font-display text-[38px] font-semibold leading-[1.2] tracking-[0.01em] text-white">
              What our users are saying
            </h2>
          </div>
        </div>

  
        <div className="relative z-10 mx-auto mt-8 grid gap-y-[28px] px-6 md:px-12">
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
      </div>
    </section>
  );
}


function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="relative h-[215px] w-[410px] shrink-0 rounded-[24px] border-2 border-[#6951F2] bg-transparent p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),0_0_12px_rgba(105,81,242,0.25)]">
      <div className="mb-3.5 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#6951F2] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
          {r.avatar && (
            <Image
              src={r.avatar}
              alt={r.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          )}
        </div>
        <div className="leading-none">
          <div className="font-alt text-[24px] font-semibold leading-[23px]">
            {r.name}
          </div>
          <div className="font-alt text-[14px] font-medium leading-[23px] opacity-95">
            {r.title} at {r.company}
          </div>
        </div>
      </div>

      <blockquote className="font-alt text-[16px] font-normal leading-[23px]">
        {r.quote}
      </blockquote>
    </article>
  );
}

function repeatToFill<T>(arr: T[], min: number): T[] {
  const out: T[] = [];
  while (out.length < min) out.push(...arr);
  return out.slice(0, min);
}
