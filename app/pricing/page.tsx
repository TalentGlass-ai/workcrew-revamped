"use client";

import * as React from "react";
import {
  Section,
  Container,
  Button,
} from "../../workcrew-ui/components/primitives";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";

/* ——— Tiny inline SVG icons ——— */
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42.01L3.29 9.554A1 1 0 0 1 4.71 8.134l3.03 3.03 6.54-6.58a1 1 0 0 1 1.424-.006Z"
      clipRule="evenodd"
    />
  </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M5.23 4.22a.75.75 0 0 1 1.06 0L10 7.94l3.71-3.72a.75.75 0 1 1 1.06 1.06L11.06 9l3.71 3.71a.75.75 0 0 1-1.06 1.06L10 10.06l-3.71 3.71a.75.75 0 0 1-1.06-1.06L8.94 9 5.23 5.29a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

/* Curved arrow pointing back toward the toggle */
const CurvedArrowBackLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="34" viewBox="0 0 64 34" fill="none">
    <path d="M62 8 C 46 8, 38 14, 24 24" stroke="#4D31EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 19 L24 24 L30 26" stroke="#4D31EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ======================== Types ========================= */
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

export default function PricingPage() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");
  const isYearly = billing === "yearly";

  // === THREE PLANS ONLY ===
  const plans: Plan[] = [
    {
      name: "Starter",
      price: billing === "monthly" ? 9000 : Math.round(9000 * 12 * 0.9),
      priceSuffix: "/-",
      durationLine: "/month",
      highlight: true,
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
      price: billing === "monthly" ? 16000 : Math.round(16000 * 12 * 0.9),
      priceSuffix: "/-",
      durationLine: "/month",
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
      price: billing === "monthly" ? 35000 : Math.round(35000 * 12 * 0.9),
      priceSuffix: "/-",
      durationLine: "/month",
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
            <div className="relative z-10 flex flex-col items-center text-center space-y-6" style={{ marginTop: "-100px" }}>
              <h1
                className="text-black"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 540,
                  fontSize: 48,
                  lineHeight: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                Pricing
              </h1>

              <p
                className="text-[#475467] max-w-3xl"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: 20,
                  lineHeight: "27px",
                  letterSpacing: "0.03em",
                }}
              >
                Choose the perfect plan that allows you to post job openings,
                source the best talent, and effectively grow your team to meet
                your business goals.
              </p>

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
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 500,
                            fontSize: 16,
                            lineHeight: "27px",
                            letterSpacing: "0.03em",
                            color: active ? "#FFFFFF" : "#4D31EC",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow + “10% off” */}
                <div
                  className="absolute flex items-center gap-2"
                  style={{ left: "calc(100% - 16px)", top: "-10px" }}
                >
                  <CurvedArrowBackLeft />
                  <span
                    className="inline-flex items-center px-3 py-1 text-sm text-black whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    10% off
                  </span>
                </div>
              </div>
            </div>
          </Container>

          {/* ===== Cards (3 only) ===== */}
          {/* 200px side padding so first and last cards sit 200px from screen edges */}
          <div className="relative z-10 mt-14 px-[200px]">
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
                    {/* "Recommended" tab — decreased by 4px per side */}
                    {isHighlight && (
                      <div
                        aria-hidden
                        className="absolute z-20"
                        style={{
                          left: -5,   // was -9
                          right: -5,  // was -9
                          top: -40,
                          height: 56,
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
                        <span
                          style={{
                            color: "#fff",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                            letterSpacing: "0.01em",
                          }}
                        >
                          Recommended
                        </span>
                      </div>
                    )}

                    <h3
                      className="text-[#101828]"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 560,
                        fontSize: 20,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {plan.name}
                    </h3>

                    <div className="mt-3">
                      <div
                        className={`text-indigo-600 leading-none`}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 32,
                          letterSpacing: "0.005em",
                        }}
                      >
                        ₹{plan.price.toLocaleString()}
                        {plan.priceSuffix ?? ""}
                      </div>
                      <div
                        className="mt-1 text-sm text-gray-500"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {plan.durationLine}
                      </div>
                    </div>

                    {/* CTA */}
                    {plan.name === "Enterprise" ? (
                      <button
                        type="button"
                        aria-label="Contact sales"
                        className="mt-5 mb-3 inline-flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#4D31EC] px-5 py-3 text-white font-medium hover:bg-[#4029c8] transition"
                      >
                        <span>Contact sales</span>
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Choose paid plan"
                        className="mt-5 mb-3 inline-flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#4D31EC] px-5 py-3 text-white font-medium hover:bg-[#4029c8] transition"
                      >
                        <span>Choose plan</span>
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Features — thin line only above "Hiring support fee" */}
                    <ul className="mt-1 flex-1">
                      {plan.features.map((f, i) => {
                        const isValueRow = "value" in f;
                        const borderTop =
                          f.label === "Hiring support fee" ? "border-t border-gray-100" : "";
                        return (
                          <li
                            key={i}
                            className={`py-3 flex items-center justify-between ${borderTop}`}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 14,
                              letterSpacing: "0.01em",
                            }}
                          >
                            <span className="text-gray-600">{f.label}</span>

                            {isValueRow ? (
                              <span className="font-semibold text-gray-900 text-right">
                                {f.value}
                              </span>
                            ) : f.included ? (
                              <CheckIcon className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-gray-400 shrink-0" />
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
          {/* ===== /Cards ===== */}
        </div>
      </Section>

      {/* Custom Plan CTA — viewport-aligned (180px from left), single-line headline, flexible width */}
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
            <h2
              className="text-[#101828]"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 540,
                fontSize: 40,
                lineHeight: "62px",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Looking for a custom plan that suits your team?
            </h2>

            <p
              className="text-[#475467] mt-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 16,
                lineHeight: "17px",
                letterSpacing: "0.03em",
              }}
            >
              Get in touch with our sales team to develop a plan customized for your
              organization&apos;s specific needs.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full text-white"
            style={{
              width: 173,
              height: 50,
              background: "#4D31EC",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowRightIcon className="h-5 w-5" />
              Book a demo
            </span>
          </button>
        </div>
      </Section>

      {/* FAQs — typography per spec */}
      <Section>
        <Container>
          <h2
            className="text-center mb-10 text-[#101828]"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: 20,
              lineHeight: "27px",
              letterSpacing: "0.03em",
            }}
          >
            FAQs
          </h2>

          <div className="space-y-4">
            {/* Q1 */}
            <details className="border rounded-md p-4">
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "0.03em",
                }}
              >
                Can I upgrade or downgrade my subscription mid-billing cycle?
              </summary>
              <p
                className="mt-2 text-gray-600"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                }}
              >
                Absolutely. You can upgrade or downgrade your subscription at any time during
                the billing cycle. Your plan will adjust immediately according to the package
                tier you select, and you’ll be charged or credited on a prorated basis.
              </p>
            </details>

            {/* Q2 */}
            <details className="border rounded-md p-4">
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "0.03em",
                }}
              >
                What happens to unused job credits or posting allowances at the end of my billing cycle?
              </summary>
              <p
                className="mt-2 text-gray-600"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                }}
              >
                Any unused job credits will automatically roll over to the following month.
                However, all remaining credits will expire at the end of the financial year.
              </p>
            </details>

            {/* Q3 */}
            <details className="border rounded-md p-4">
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "0.03em",
                }}
              >
                What is your cancellation and refund policy for subscription plans?
              </summary>
              <p
                className="mt-2 text-gray-600"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                }}
              >
                To cancel your subscription or request a refund, please reach out to our Sales
                or Customer Service team. They will review your account details and guide you
                through the appropriate steps based on your plan.
              </p>
            </details>

            {/* Q4 */}
            <details className="border rounded-md p-4">
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "0.03em",
                }}
              >
                Are taxes or additional fees applied to my subscription, and how are they calculated?
              </summary>
              <p
                className="mt-2 text-gray-600"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                }}
              >
                Subscription prices are listed exclusive of taxes. Applicable taxes such as GST
                in India or state tax in the United States will be calculated based on your
                billing region and added on top of the invoice amount.
              </p>
            </details>

            {/* Q5 */}
            <details className="border rounded-md p-4">
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: "0.03em",
                }}
              >
                Do you support custom or enterprise plans with tailored features and pricing?
              </summary>
              <p
                className="mt-2 text-gray-600"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                }}
              >
                Yes, we offer custom and enterprise plans designed to meet specific
                organizational needs. Please contact our Sales team to discuss your
                requirements and receive a personalized quote.
              </p>
            </details>
          </div>
        </Container>
      </Section>

      <NewFooter />
    </main>
  );
}
