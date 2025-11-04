// PATH: app/onboarding-employer/pricing/page.tsx
"use client";

import * as React from "react";
import T from "../../../workcrew-ui/components/primitives/Typography";

/* Arrow icon for CTAs */
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

/* External actions */
const SALES_CALENDAR_URL = "https://calendar.app.google/aLFgZjQ3dFf8oBSXA";
const DEMO_PLACEHOLDER_URL = "/demo-placeholder";
const RAZORPAY_LINKS: Record<string, string> = {
  Starter: "https://razorpay.com",
  Growth: "https://razorpay.com",
  Enterprise: "https://razorpay.com",
};

type FeatureRow =
  | { label: string; value: string }
  | { label: string; included: boolean };

type Plan = {
  name: "Starter" | "Growth" | "Enterprise";
  price: number | null;
  priceSuffix?: string;
  durationLine?: string;
  highlight?: boolean;
  cta: string;
  features: FeatureRow[];
  hidePrice?: boolean;
};

export default function EmployerPricingOnboarding() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");
  const isYearly = billing === "yearly";

  const goToCalendarThenDemo = () => {
    window.open(SALES_CALENDAR_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => (window.location.href = DEMO_PLACEHOLDER_URL), 800);
  };

  const openRazorpay = (planName: Plan["name"]) => {
    const href = RAZORPAY_LINKS[planName] ?? "https://razorpay.com";
    window.open(href, "_blank", "noopener,noreferrer");
  };

  // 🔁 Plans aligned with main /pricing page
  const plans: Plan[] = [
    {
      name: "Starter",
      price: billing === "monthly" ? 9000 : Math.round(9000 * 12 * 0.9),
      priceSuffix: "/-",
      durationLine: "/month",
      cta: "Choose plan",
      features: [
        { label: "Seat", value: "1 Seat" },
        {
          label: "Resume access",
          value: "Premium DB - Assessment & interviews",
        },
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
      highlight: true,
      cta: "Choose plan",
      features: [
        { label: "Seat", value: "1 Seat" },
        {
          label: "Resume access",
          value: "Premium DB - Assessment & interviews",
        },
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
      price: null,
      // no durationLine & no price — mirrors main pricing page
      hidePrice: true,
      cta: "Contact sales",
      features: [
        { label: "Seat", value: "1 Seat" },
        {
          label: "Resume access",
          value: "Premium DB - Assessment & interviews",
        },
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
    <main className="relative min-h-screen bg-white">
      {/* WorkCrew.ai logo: exactly 50px from top & left */}
      <img
        src="/logo.png"
        alt="WorkCrew.ai"
        width={116}
        height={21}
        className="absolute top-[50px] left-[50px]"
      />

      {/* All other content shifted down by 100px */}
      <section className="mx-auto max-w-6xl px-6 pt-[150px]">
        {/* Title + subtitle using same Typography system */}
        <T
          as="h1"
          variant="hero48"
          className="text-center text-black"
          autoLeading
        >
          Choose your <span className="text-[#4D31EC]">plan</span>
        </T>

        <T
          as="p"
          variant="sub20"
          className="mx-auto mt-3 max-w-2xl text-center text-black"
          weight={400}
          lineHeightPx={27}
          trackingPct={3}
        >
          Select the perfect plan to start posting jobs and discovering top
          talent on WorkCrew.ai
        </T>

        {/* Billing Toggle (Typography for labels & badge) */}
        <div className="relative mt-8 flex w-full justify-center">
          <div className="relative mx-auto" style={{ width: 227, height: 62 }}>
            <div
              className="absolute inset-0 rounded-full bg-white/70 shadow-sm"
              style={{
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
                  transform: `translate(${isYearly ? 119 : 8}px, -50%)`,
                  background: "#4D31EC",
                  boxShadow:
                    "0 6px 18px rgba(77,49,236,0.25), inset 0 1px 0 rgba(255,255,255,0.35)",
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
                      onClick={() =>
                        setBilling(idx === 0 ? "monthly" : "yearly")
                      }
                      className="relative z-10 flex items-center justify-center"
                    >
                      <T
                        as="span"
                        variant="body16"
                        weight={500}
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

            {/* Arrow + “10% off” badge */}
            <div
              className="pointer-events-none absolute -top-6 right-[-78px] flex items-center gap-2"
              aria-hidden
            >
              <img
                src="/icons/curved-arrow.svg"
                alt=""
                width={54}
                height={28}
              />
              <T
                as="span"
                variant="sub14"
                weight={700}
                trackingPct={2}
                className="text-black"
              >
                10% off
              </T>
            </div>
          </div>
        </div>

        {/* Cards (aligned with app/pricing) */}
        <div className="mt-[150px] grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlight = !!plan.highlight;
            const base =
              "relative rounded-xl bg-white flex flex-col overflow-visible min-h-[600px] p-6 pb-12 border border-gray-200 shadow-sm";

            const handleCTA =
              plan.cta.toLowerCase().includes("contact")
                ? goToCalendarThenDemo
                : () => openRazorpay(plan.name);

            return (
              <div
                key={plan.name}
                className={
                  highlight
                    ? `${base.replace(
                        "border-gray-200",
                        "border-[#4D31EC]"
                      )} -translate-y-4 pt-16 px-6`
                    : base
                }
                style={
                  highlight
                    ? {
                        borderWidth: 2.5,
                        boxShadow:
                          "0 12px 30px rgba(77,49,236,0.25), 0 0 0 3px rgba(77,49,236,0.18)",
                      }
                    : undefined
                }
              >
                {highlight && (
                  <div
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
                    <T
                      as="span"
                      variant="sub14"
                      weight={600}
                      className="text-white"
                    >
                      Recommended
                    </T>
                  </div>
                )}

                {/* Header */}
                <div className="flex min-h-[150px] flex-col items-center justify-end text-center">
                  <T
                    as="h3"
                    variant="sub20"
                    weight={560}
                    className="text-[#101828]"
                  >
                    {plan.name}
                  </T>

                  <div className="mt-3">
                    {/* price only when not hidden (Enterprise hides) */}
                    {!plan.hidePrice && plan.price !== null && (
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
                        ₹{plan.price.toLocaleString()}
                        {plan.priceSuffix ?? ""}
                      </div>
                    )}

                    {/* duration line: also hidden for Enterprise */}
                    {!plan.hidePrice && plan.durationLine && (
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
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  aria-label={plan.cta}
                  onClick={handleCTA}
                  className="mb-3 mt-5 inline-flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#4D31EC] px-5 py-3 text-white transition hover:bg-[#4029c8]"
                >
                  <T as="span" variant="sub14" weight={500}>
                    {plan.cta}
                  </T>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                {/* Features */}
                <ul className="mt-1 flex-1">
                  {plan.features.map((f, i) => {
                    const isValue = "value" in f;
                    const divider =
                      f.label === "Hiring support fee"
                        ? "border-t border-gray-100"
                        : "";
                    return (
                      <li
                        key={i}
                        className={`flex items-center justify-between py-3 ${divider}`}
                      >
                        <T
                          as="span"
                          variant="sub14"
                          weight={500}
                          className="text-[#444953]"
                        >
                          {f.label}
                        </T>

                        {isValue ? (
                          <T
                            as="span"
                            variant="sub14"
                            weight={500}
                            className="text-right text-black"
                          >
                            {f.value}
                          </T>
                        ) : f.included ? (
                          <img
                            src="/icons/hugeicons_tick-02.png"
                            alt="Included"
                            width={20}
                            height={20}
                          />
                        ) : (
                          <img
                            src="/icons/uim_multiply.png"
                            alt="Not included"
                            width={20}
                            height={20}
                            style={{ opacity: 0.7 }}
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

        {/* Bottom footnote using Typography */}
        <T
          as="p"
          variant="sub20"
          weight={400}
          className="mt-10 pb-16 text-center text-black"
        >
          Not sure yet? Get a <span className="underline">free trial</span> for
          a week
        </T>
      </section>
    </main>
  );
}
