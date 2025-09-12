// workcrew-ui/components/landing/NewRecruitmentCompanySection.tsx
"use client";

import * as React from "react";
import { Section, Container } from "../primitives";
import { T } from "../primitives/Typography";

type Step = { title: string; description: string; icon?: React.ReactNode };

type Props = {
  id?: string;
  eyebrow?: string;
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  steps?: Step[];
  className?: string;
  // ✅ match Section.tsx: "subtle" | "default" | "tinted"
  background?: "subtle" | "default" | "tinted";
};

export default function NewRecruitmentCompanySection({
  id = "how-we-do-it",
  eyebrow = "Process",
  heading = <>Here’s <span className="font-bold">how</span> we do it!</>,
  subheading = "We provide clarity, efficiency, and intelligence at every stage of hiring.",
  steps = [
    { title: "Step 1", description: "Describe your process here." },
    { title: "Step 2", description: "Add clarity on the second stage." },
    { title: "Step 3", description: "Wrap up with the final stage." },
  ],
  className = "",
  background = "subtle",
}: Props) {
  return (
    <Section id={id} size="lg" background={background} className={className}>
      <Container>
        <T as="p" variant="body" className="mb-2 text-sm uppercase tracking-wide text-gray-500">
          {eyebrow}
        </T>

        <T as="h2" variant="heroTitle" className="mb-3">
          {heading}
        </T>

        <T as="p" variant="bodyLg" className="mb-8 text-gray-700">
          {subheading}
        </T>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <article
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              aria-label={`Step ${i + 1}: ${s.title}`}
            >
              {s.icon ? (
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  {s.icon}
                </div>
              ) : (
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  {i + 1}
                </div>
              )}

              <T as="h3" variant="h3" className="mb-2 font-semibold">
                {s.title}
              </T>

              <T as="p" variant="bodyLg" className="text-gray-600">
                {s.description}
              </T>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
