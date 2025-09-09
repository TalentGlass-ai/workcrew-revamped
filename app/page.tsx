"use client";

import * as React from "react";
import { useState } from "react";

import {
  NewNavbar,
  HeroSection,
  LogoMarquee,
  FeatureShowcase,
  Employers,
  NewRecruitmentCompany,
  NewFeaturedJob,
  NewBottomSection,
  NewFooter,
  } from "../workcrew-ui/components/landing";
import {
  Section,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Card,
  Input,
  Badge,
} from "../workcrew-ui/components/primitives";

import { tokens } from "../workcrew-ui/styles/tokens"; // this one is okay

{process.env.NODE_ENV === "development" && <div style={{position:'fixed',top:8,right:8,background:'#ffe58f',padding:6,zIndex:9999}}>BUILD: {Date.now()}</div>}

export default function HomePage() {
  const [jobs, setJobs] = useState<any[]>([]);

  return (
    <main>
      {/* Top nav */}
      <Section size="sm" background="default" withContainer={false}>
        <Container>
          <NewNavbar />
        </Container>
      </Section>

      {/* Hero */}
      <Section size="lg" background="tinted">
        <Container>
          <HeroSection />
        </Container>
      </Section>

      {/* Logos / social proof */}
      <Section size="md" background="default">
        <Container>
          <Employers />
        </Container>
      </Section>

      {/* How it works */}
      <Section size="lg" background="subtle">
        <Container>
          <NewRecruitmentCompany />
        </Container>
      </Section>

      {/* Featured jobs */}
      <Section size="lg" background="default">
        <Container>
          <NewFeaturedJob setJobs={setJobs} />
        </Container>
      </Section>

      {/* CTA / pre-footer */}
      <Section size="md" background="tinted">
        <Container>
          <NewBottomSection />
        </Container>
      </Section>

      {/* Contact form */}
      <Section size="lg" background="default">
        <Container>
          <Heading as={2}>
            <span style={{ color: tokens.colors.primary }}>Contact</span> us
          </Heading>
          <Text as="p" style={{ marginTop: 8, marginBottom: 24 }}>
            Connect with our team to discover how WorkCrew.ai can streamline your
            company’s talent acquisition and HR operations.
          </Text>

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
              <Button variant="primary">Get in touch</Button>
            </Card>

            {/* highlights */}
            <Card padding="lg" elevation="md">
              <Heading as={4}>Why WorkCrew.ai</Heading>
              <div style={{ height: 12 }} />
              <Grid cols={{ base: 1 }} gap={10}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="brand" soft>5000+ Candidates</Badge>
                  <Text as="span">Quality, verified profiles</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="success" soft>Assessment-backed</Badge>
                  <Text as="span">Better matches, faster</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="warning" soft>Salary transparency</Badge>
                  <Text as="span">Fair, open process</Text>
                </div>
              </Grid>
              <div style={{ height: 16 }} />
              <Button variant="secondary">See pricing</Button>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Footer */}
      <Section size="md" background="default" withContainer={false}>
        <NewFooter />
      </Section>
    </main>
  );
}
