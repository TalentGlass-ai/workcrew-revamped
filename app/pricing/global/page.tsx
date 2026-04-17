// PATH: app/pricing/global/page.tsx
"use client";

import * as React from "react";
import {
  Section,
  Container,
} from "@/components/primitives";
import NewNavbar from "@/components/landing/NewNavbar";
import NewFooter from "@/components/landing/NewFooter";
import T from "@/components/primitives/Typography";

/* ——— Tiny inline SVG icon kept only for the arrow on buttons ——— */
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 1 0 1.414 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

/*  Types  */
type FeatureRow =
  | { label: string; value: string }
  | { label: string; included: boolean };

type Plan = {
  name: string;
  price: number;
  priceSuffix?: string;
  durationLine?: string;
  highlight?: boolean;
  cta: string;
  features: FeatureRow[];
};

export default function GlobalPricingPage() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");
  const isYearly = billing === "yearly";

  // === THREE PLANS FOR GLOBAL ===
  const plans: Plan[] = [
    {
      name: "Starter",
      price: billing === "monthly" ? 99 : Math.round(99 * 12 * 0.9),
      durationLine: "/month",
      highlight: false,
      cta: "Choose plan",
      features: [
        { label: "Seat", value: "1 Seat" },
        { label: "Resume access", value: "Premium DB - Assessment & interviews" },
        { label: "Contact credits", value: "250" },
        { label: "Role posting", value: "Upto 3 roles" },
        { label: "Usage analytics", included: true },
        { label: "Priority support", included: false },
        { label: "Onboarding & training", included: true },
        { label: "Customer success", included: false },
        { label: "Hiring support fee", value: "5%" },
      ],
    },
    {
      name: "Growth",
      price: billing === "monthly" ? 199 : Math.round(199 * 12 * 0.9),
      durationLine: "/month",
      highlight: true, // ✅ Recommended
      cta: "Choose plan",
      features: [
        { label: "Seat", value: "1 Seat" },
        { label: "Resume access", value: "Premium DB - Assessment & interviews" },
        { label: "Contact credits", value: "750" },
        { label: "Role posting", value: "Unlimited" },
        { label: "Usage analytics", included: true },
        { label: "Priority support", value: "Email, chat, Slack" },
        { label: "Onboarding & training", included: true },
        { label: "Customer success", included: true },
        { label: "Hiring support fee", value: "5%" },
      ],
    },
    {
      name: "Enterprise",
      price: billing === "monthly" ? 399 : Math.round(399 * 12 * 0.9),
      durationLine: "/month",
      highlight: false,
      cta: "Contact sales",
      features: [
        { label: "Seat", value: "1 Seat" },
        { label: "Resume access", value: "Premium DB - Assessment & interviews" },
        { label: "Contact credits", value: "750" },
        { label: "Role posting", included: false },
        { label: "Usage analytics", included: true },
        { label: "Priority support", value: "Email, chat, Slack" },
        { label: "Onboarding & training", included: true },
        { label: "Customer success", included: true },
        { label: "Hiring support fee", value: "5%" },
      ],
    },
  ];

  return (
    <main>
      {/* SEO Meta - would be in layout or head */}
      <head>
        <title>WorkCrew.ai Pricing - Global | AI-Powered Recruitment Platform</title>
        <meta name="description" content="Choose the perfect WorkCrew.ai plan for your global business. AI-powered recruitment with competitive pricing. Start hiring smarter today." />
        <meta name="keywords" content="recruitment software, AI hiring platform, job posting, talent acquisition, HR software" />
        <link rel="canonical" href="https://workcrew.ai/pricing/global" />
      </head>

      {/* Navbar */}
      <Section size="sm" background="default" withContainer={false}>
        <Container>
          <NewNavbar />
        </Container>
      </Section>

      {/* Header + Decorative circle */}
      <Section withContainer={false}>
        <div className="relative">
          {/* Decorative circle */}
          <div
            aria-hidden
            className="pointer-events-none absolute z-[1] rounded-full"
            style={{
              width: 643,
              height: 643,
              top: -184,
              left: "calc(50% + 12px)",
              transform: "translateX(-50%)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              background: `
                repeating-linear-gradient(0deg, rgba(163,157,255,0.12) 0px, rgba(163,157,255,0.12) 1px, transparent 1px, transparent 38px),
                repeating-linear-gradient(90deg, rgba(163,157,255,0.12) 0px, rgba(163,157,255,0.12) 1px, transparent 1px, transparent 38px)
              `,
            }}
          />

          {/* Header content inside Container */}
          <Container>
            <div
              className="relative z-10 flex flex-col items-center text-center space-y-6"
              style={{ marginTop: "-100px" }}
            >
              <T as="h1" variant="hero48" className="text-black" autoLeading>
                Global Pricing
              </T>

              {/* Subtitle — black (#000) */}
              <T
                as="p"
                variant="sub20"
                className="max-w-3xl text-black"
                weight={400}
                lineHeightPx={27}
                trackingPct={3}
              >
                Choose the perfect plan that allows you to post job openings,
                source the best talent, and effectively grow your team to meet
                your business goals. All prices in USD.
              </T>

              {/* Region selector */}
              <div className="flex space-x-4 mt-4">
                <span className="font-medium text-black">Global Pricing</span>
                <span className="text-gray-600">•</span>
                <a href="/pricing/india" className="text-blue-600 hover:underline">India Pricing</a>
              </div>

              {/* Toggle */}
              <div className="relative mt-[100px] flex flex-col items-center gap-4">
                <div
                  className="relative rounded-full bg-white/70 shadow-sm"
                  style={{
                    width: 227,
                    height: 62,
                    border: "1px solid #4D31EC",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 22px rgba(61,79,255,0.12)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                >
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-out"
                    style={{
                      width: 100,
                      height: 47,
                      transform: `translate(${isYearly ? 227 - 100 - 8 : 8}px, -50%)`,
                      background: "linear-gradient(180deg, #4D31EC 0%, #4D31EC 100%)",
                      boxShadow:
                        "0 6px 18px rgba(77,49,236,0.25), inset 0 1px 0 rgba(255,255,255,0.35)",
                      border: "none",
                    }}
                  />
                  <div className="absolute inset-0 grid grid-cols-2">
                    {["Monthly", "Yearly"].map((label, idx) => {
                      const active =
                        (idx === 0 && billing === "monthly") ||
                        (idx === 1 && billing === "yearly");
                      return (
                        <button
                          key={label}
                          onClick={() => setBilling(idx === 0 ? "monthly" : "yearly")}
                          className="relative z-10 flex items-center justify-center"
                        >
                          <T
                            as="span"
                            variant="body16"
                            weight={500}
                            lineHeightPx={27}
                            trackingPct={3}
                            className={active ? "text-white" : "text-[#4D31EC]"}
                          >
                            {label}
                          </T>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow (image) + "10% off" */}
                <div
                  className="absolute flex items-center gap-2"
                  style={{ left: "calc(100% - 16px)", top: "-10px" }}
                >
                  <img
                    src="/icons/curved-arrow.svg"
                    alt="Curved arrow"
                    width={64}
                    height={34}
                    style={{
                      objectFit: "contain",
                      transform: "translate(20px, -10px)",
                    }}
                  />
                  <T as="span" variant="sub14" weight={600} trackingPct={2} className="text-black">
                    10% off
                  </T>
                </div>
              </div>
            </div>
          </Container>

          {/* Cards (3 only)  */}
          <div className="relative z-10 mt-[106px] px-[200px]">
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {plans.map((plan) => {
                const isHighlight = !!plan.highlight;

                const baseCard =
                  "relative rounded-xl bg-white flex flex-col overflow-visible min-h-[600px] p-6 pb-12 border border-gray-200 shadow-sm";

                return (
                  <div
                    key={plan.name}
                    className={
                      isHighlight
                        ? `${baseCard.replace("border-gray-200", "border-[#4D31EC]")} -translate-y-4 pt-16 px-6`
                        : baseCard
                    }
                    style={
                      isHighlight
                        ? {
                            borderWidth: 2.5,
                            boxShadow:
                              "0 12px 30px rgba(77,49,236,0.25), 0 0 0 3px rgba(77,49,236,0.18)",
                          }
                        : undefined
                    }
                  >
                    {/* "Recommended" tab */}
                    {isHighlight && (
                      <div
                        aria-hidden
                        className="absolute z-20"
                        style={{
                          left: -4,
                          right: -4,
                          top: -38,
                          height: 54,
                          border: "2.5px solid #4D31EC",
                          borderBottom: "none",
                          borderTopLeftRadius: 14,
                          borderTopRightRadius: 14,
                          background: "#4D31EC",
                          boxShadow: "0 10px 24px rgba(77,49,236,0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <T as="span" variant="sub14" weight={600} className="text-white">
                          Recommended
                        </T>
                      </div>
                    )}

                    {/* Center-aligned name + price + duration */}
                    <div className="flex flex-col items-center text-center">
                      <T
                        as="h3"
                        variant="sub20"
                        weight={560}
                        className="text-[#101828]"
                        lineHeightPx={27}
                        trackingPct={1}
                      >
                        {plan.name}
                      </T>

                      <div className="mt-3">
                        {/* price */}
                        <div
                          className="leading-none"
                          style={{
                            color: "#4D31EC",
                            fontFamily: "Archivo, var(--font-display)",
                            fontWeight: 700,
                            fontSize: 32,
                            letterSpacing: "0.005em",
                          }}
                        >
                          ${plan.price}
                        </div>
                        {/* "/month" — Archivo medium 20/27, 0.03em, #808080 */}
                        <T
                          as="div"
                          variant="sub20"
                          weight={500}
                          lineHeightPx={27}
                          trackingPct={3}
                          className="mt-[14px] text-[#808080]"
                        >
                          {plan.durationLine}
                        </T>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      aria-label={plan.cta}
                      className="mt-5 mb-3 inline-flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#4D31EC] px-5 py-3 text-white hover:bg-[#4029c8] transition"
                      onClick={() => {
                        // Conversion tracking
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'pricing_click', {
                            plan_name: plan.name,
                            region: 'global',
                            billing: billing
                          });
                        }
                      }}
                    >
                      <T
                        as="span"
                        variant="sub14"
                        weight={500}
                        lineHeightPx={27}
                        trackingPct={3}
                      >
                        {plan.cta}
                      </T>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>

                    {/* Features */}
                    <ul className="mt-1 flex-1">
                      {plan.features.map((f, i) => {
                        const isValueRow = "value" in f;
                        const borderTop =
                          f.label === "Hiring support fee" ? "border-t border-gray-100" : "";
                        return (
                          <li
                            key={i}
                            className={`py-3 flex items-center justify-between ${borderTop}`}
                          >
                            {/* Left label — Archivo medium 12/17, 3%, #444953 */}
                            <T
                              as="span"
                              variant="sub14"
                              weight={500}
                              lineHeightPx={17}
                              trackingPct={3}
                              className="text-[#444953]"
                              style={{ fontSize: 12 }}
                            >
                              {f.label}
                            </T>

                            {/* Right value / icon */}
                            {isValueRow ? (
                              <T
                                as="span"
                                variant="sub14"
                                weight={500}
                                lineHeightPx={17}
                                trackingPct={3}
                                className="text-black text-right"
                                style={{ fontSize: 12 }}
                              >
                                {f.value}
                              </T>
                            ) : f.included ? (
                              <img
                                src="/icons/hugeicons_tick-02.png"
                                alt="Included"
                                width={20}
                                height={20}
                                style={{ display: "block" }}
                              />
                            ) : (
                              <img
                                src="/icons/uim_multiply.png"
                                alt="Not included"
                                width={20}
                                height={20}
                                style={{ display: "block", opacity: 0.7 }}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          {/* /Cards  */}
        </div>
      </Section>

      {/* Custom Plan CTA */}
      <Section withContainer={false}>
        <div
          className="rounded-[16px] flex items-center gap-6"
          style={{
            marginLeft: 180,
            width: "fit-content",
            maxWidth: "calc(100vw - 200px)",
            padding: 24,
            background:
              "linear-gradient(90deg, rgba(147,129,250,0.17) 0%, rgba(169,195,247,0.10) 100%)",
          }}
        >
          <div className="flex flex-col items-start">
            <T
              as="h2"
              variant="hero48"
              weight={540}
              trackingPct={1}
              className="text-[#101828] whitespace-nowrap pt-5 pb-5"
              autoLeading
              style={{ fontSize: 40, lineHeight: "62px" }}
            >
              Looking for a custom plan that suits your team?
            </T>

            <T
              as="p"
              variant="body16"
              weight={500}
              trackingPct={3}
              className="text-[#475467] mt-2"
              lineHeightPx={17}
            >
              Get in touch with our sales team to develop a plan customized for your
              organization&apos;s specific needs.
            </T>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full text-white"
            style={{
              width: 173,
              height: 50,
              background: "#4D31EC",
              fontFamily: "Archivo, var(--font-sans)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
            onClick={() => {
              // Conversion tracking
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'custom_plan_click', {
                  region: 'global'
                });
              }
            }}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowRightIcon className="h-5 w-5" />
              Book a demo
            </span>
          </button>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <Container>
          {/* Heading */}
          <T
            as="h2"
            variant="hero48"
            className="text-center mb-4 text-[#101828]"
            autoLeading
          >
            FAQs
          </T>

          {/* Helper line under the heading */}
          <T
            as="p"
            variant="sub20"
            weight={400}
            lineHeightPx={27}
            trackingPct={3}
            className="text-center mb-10 text-black"
          >
            Can&apos;t find the answer you&apos;re looking for? Reach out to our support
          </T>

          {/* FAQ items */}
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade my subscription mid-billing cycle?",
                a: "Absolutely. You can upgrade or downgrade your subscription at any time during the billing cycle. Your plan will adjust immediately according to the package tier you select, and you'll be charged or credited on a prorated basis.",
              },
              {
                q: "What happens to unused job credits or posting allowances at the end of my billing cycle?",
                a: "Any unused job credits will automatically roll over to the following month. However, all remaining credits will expire at the end of the financial year.",
              },
              {
                q: "What is your cancellation and refund policy for subscription plans?",
                a: "To cancel your subscription or request a refund, please reach out to our Sales or Customer Service team. They will review your account details and guide you through the appropriate steps based on your plan.",
              },
              {
                q: "Are taxes or additional fees applied to my subscription, and how are they calculated?",
                a: "Subscription prices are listed exclusive of taxes. Applicable taxes such as VAT, GST, or state tax will be calculated based on your billing region and added on top of the invoice amount.",
              },
              {
                q: "Do you support custom or enterprise plans with tailored features and pricing?",
                a: "Yes, we offer custom and enterprise plans designed to meet specific organizational needs. Please contact our Sales team to discuss your requirements and receive a personalized quote.",
              },
            ].map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-[12px] border border-gray-200 bg-white shadow-sm"
              >
                <summary
                  className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
                  style={{ listStyle: "none" }}
                >
                  <T
                    as="span"
                    variant="body16"
                    weight={500}
                    trackingPct={3}
                    className="text-[#0F172A]"
                  >
                    {q}
                  </T>
                  <svg
                    className="faq-chevron transition-transform duration-200"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="#0F172A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-4 -mt-1">
                  <T
                    as="p"
                    variant="sub14"
                    weight={500}
                    trackingPct={3}
                    className="text-gray-600"
                  >
                    {a}
                  </T>
                </div>
              </details>
            ))}
          </div>

          {/* Hide native markers + rotate chevron on open */}
          <style jsx>{`
            summary::-webkit-details-marker {
              display: none;
            }
            details > summary {
              list-style: none;
            }
            details[open] .faq-chevron {
              transform: rotate(180deg);
            }
          `}</style>
        </Container>
      </Section>

      <NewFooter />
    </main>
  );
}