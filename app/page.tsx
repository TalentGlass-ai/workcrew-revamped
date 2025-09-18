"use client";

import * as React from "react";
import { useState } from "react";

import {
  NewNavbar,
  HeroSection,          // contains: logo marquee + big statement + feature slides
  MeetRahiBanner,
  WhyTheyLoveUs,        // your hireOrGetHired section
  WhyLoveUs,            // "Why professionals and teams love us"
  ReviewsSection,       // ✅ reviews wall with focus overlay
  NewFooter,
} from "../workcrew-ui/components/landing";

import {
  Section,
  Container,
  Button,
  Grid,
  Card,
  Input,
  Badge,
} from "../workcrew-ui/components/primitives";

import { tokens } from "../workcrew-ui/styles/tokens";
import { T } from "../workcrew-ui/components/primitives/Typography";

// Dev-only build badge
function DevBuildBadge() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        background: "#ffe58f",
        padding: 6,
        zIndex: 9999,
      }}
    >
      BUILD: {Date.now()}
    </div>
  );
}

export default function HomePage() {
  // reserved for future jobs wiring
  const [jobs, setJobs] = useState<any[]>([]);

  return (
    <main>
      <DevBuildBadge />

      {/* 1) Nav bar */}
      <Section size="sm" background="default" withContainer={false}>
        <Container>
          <NewNavbar />
        </Container>
      </Section>

      {/* 2) HeroSection (logo marquee + big statement + feature slides live inside) */}
      <HeroSection />

      {/* 3) Hire or Get Hired (temporarily named WhyTheyLoveUs in codebase) */}
      <Section size="lg" background="default" withContainer={false}>
        <WhyTheyLoveUs />
      </Section>

      {/* 4) Meet RAHI banner */}
      <Section size="lg" background="default" withContainer={false}>
        <MeetRahiBanner />
      </Section>

      {/* 5) Why professionals and teams love us */}
      <Section size="lg" background="default" withContainer={false}>
        <WhyLoveUs />
      </Section>

      {/* 5.1) Follow-up statement block with top & bottom lines */}
      <Section size="lg" background="default" withContainer={false}>
        <div className="mx-auto max-w-[1106px] text-center py-16">
          {/* Stack: line → text group → line (gap 76px) */}
          <div className="mx-auto flex flex-col items-center gap-[76px]">
            {/* Top grey line */}
            <div className="h-px w-[320px] bg-[#D0D5DD]" />

            {/* Text group (625px) */}
            <div className="mx-auto max-w-[625px]">
              <h2
                className="text-[40px] font-medium leading-[1] tracking-[0.01em] text-black"
                style={{ fontFamily: "var(--font-display)" }} // Schibsted Grotesk
              >
                “WorkCrew.ai fixed the broken system.” – We say
              </h2>

              <p
                className="mt-6 text-[32px] font-medium leading-[1] tracking-[0.01em] text-[#4D31EC]"
                style={{ fontFamily: "var(--font-display)" }} // Schibsted Grotesk
              >
                Here’s what that means for you – New opportunities!
              </p>
            </div>

            {/* Bottom grey line */}
            <div className="h-px w-[320px] bg-[#D0D5DD]" />
          </div>
        </div>
      </Section>

      {/* 5.2) Reviews section */}
      <Section size="lg" background="default" withContainer={false}>
        <ReviewsSection />
      </Section>

      {/* 6) Contact us */}
      <Section size="lg" background="default">
        <Container>
          <T as="h2">
            <span style={{ color: tokens.colors.primary }}>Contact</span> us
          </T>
          <T as="p" style={{ marginTop: 8, marginBottom: 24 }}>
            Connect with our team to discover how WorkCrew.ai can streamline your
            company’s talent acquisition and HR operations.
          </T>

          <Grid cols={{ base: 1, md: 2 }} gap={16}>
            <Card padding="md">
              <Grid cols={{ base: 1, md: 2 }} gap={12}>
                <Input label="Company name *" placeholder="Enter your company name" requiredMark />
                <Input label="Contact person *" placeholder="Your full name" requiredMark />
                <Input label="Business email *" placeholder="you@company.com" requiredMark />
                <Input label="Phone number *" placeholder="1234567890" requiredMark />
                <Input label="Company size *" placeholder="Select company size" />
                <Input label="Your role *" placeholder="Select your role" />
              </Grid>

              <div style={{ height: 12 }} />
              <Input label="Description" placeholder="Tell us more about your hiring needs" />

              <div style={{ height: 16 }} />
              <Button tone="primary" variant="solid">Get started</Button>
            </Card>

            {/* highlights */}
            <Card padding="lg" elevation="md">
              <T as="h4">Why WorkCrew.ai</T>
              <div style={{ height: 12 }} />
              <Grid cols={{ base: 1 }} gap={10}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="brand" soft>5000+ Candidates</Badge>
                  <T as="span">Quality, verified profiles</T>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="success" soft>Assessment-backed</Badge>
                  <T as="span">Better matches, faster</T>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="warning" soft>Salary transparency</Badge>
                  <T as="span">Fair, open process</T>
                </div>
              </Grid>
              <div style={{ height: 16 }} />
              <Button tone="secondary" variant="outline">Learn more</Button>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* 7) Footer */}
      <Section size="md" background="default" withContainer={false}>
        <NewFooter />
      </Section>
    </main>
  );
}
