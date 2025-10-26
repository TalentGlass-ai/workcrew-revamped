"use client";

import * as React from "react";
import { Section, Container } from "../../workcrew-ui/components/primitives";
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";
import T from "../../workcrew-ui/components/primitives/Typography";

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M10.293 15.707a1 1 0 0 1 0-1.414L12.586 12H4a1 1 0 1 1 0-2h8.586l-2.293-2.293A1 1 0 0 1 11.707 6.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
  </svg>
);

/* =========================
   EXTERNAL LINKS / PLACEHOLDERS
   ========================= */
const SALES_CALENDAR_URL = "https://calendar.app.google/aLFgZjQ3dFf8oBSXA";
// Replace this with your real demo video URL when ready:
const DEMO_PLACEHOLDER_URL = "/demo-placeholder"; // e.g. /videos/demo.mp4 or /demo

// Put your Razorpay payment links here (live or test).
// If a plan link is missing, we fall back to razorpay.com home.
const RAZORPAY_LINKS: Record<string, string> = {
  Starter: "https://razorpay.com",  // e.g. "https://rzp.io/l/workcrew-starter"
  Growth: "https://razorpay.com",   // e.g. "https://rzp.io/l/workcrew-growth"
  Enterprise: "https://razorpay.com" // rarely used (sales route), kept for completeness
};

type FeatureRow =
  | { label: string; value: string }
  | { label: string; included: boolean };

type Plan = {
  name: string;
  price: number | null;
  priceSuffix?: string;
  durationLine?: string;
  highlight?: boolean;
  cta: string;
  features: FeatureRow[];
  hidePrice?: boolean;
};

export default function PricingPage() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");
  const isYearly = billing === "yearly";

  // Open a Razorpay link (placeholder-safe).
  const openRazorpay = (planName: string) => {
    const href = RAZORPAY_LINKS[planName] ?? "https://razorpay.com";
    window.open(href, "_blank", "noopener,noreferrer");
  };

  // Open Calendar for booking, then route to demo placeholder on current tab.
  const goToCalendarThenDemo = () => {
    window.open(SALES_CALENDAR_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.location.href = DEMO_PLACEHOLDER_URL;
    }, 800);
  };

  // Plans
  const plans: Plan[] = [
    {
      name: "Starter",
      price: billing === "monthly" ? 9000 : Math.round(9000 * 12 * 0.9),
      priceSuffix: "/-",
      durationLine: "/month",
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
      highlight: true,
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
      price: null,
      durationLine: "/month",
      hidePrice: true,
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

      {/* Header + Pricing */}
      <Section withContainer={false}>
        <div className="relative">
          {/* decorative grid circle */}
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

          <Container>
            <div
              className="relative z-10 flex flex-col items-center text-center space-y-6"
              style={{ marginTop: "-100px" }}
            >
              <T as="h1" variant="hero48" className="text-black" autoLeading>
                Pricing
              </T>

              <T
                as="p"
                variant="sub20"
                className="max-w-3xl text-black"
                weight={400}
                lineHeightPx={27}
                trackingPct={3}
              >
                Choose the perfect plan that allows you to post job openings, source the best
                talent, and effectively grow your team.
              </T>

              {/* ===== Centered billing toggle with arrow+label positioned like Figma ===== */}
              <div className="relative mt-[88px] w-full flex justify-center">
                {/* Fixed-width wrapper keeps the pill perfectly centered */}
                <div className="relative mx-auto" style={{ width: 227, height: 62 }}>
                  {/* Toggle pill */}
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

                  {/* Arrow + “10% off” — single row, top-right of the pill pointing to Yearly */}
                  <div
                    className="pointer-events-none absolute -top-6 right-[-78px] flex items-center gap-2 whitespace-nowrap"
                    aria-hidden
                  >
                    <img
                      src="/icons/curved-arrow.svg"
                      alt=""
                      width={54}
                      height={28}
                      style={{ objectFit: "contain" }}
                    />
                    <T as="span" variant="sub14" weight={700} trackingPct={2} className="text-black">
                      10% off
                    </T>
                  </div>
                </div>
              </div>
              {/* ===== /Centered billing toggle ===== */}
            </div>
          </Container>

          {/* cards */}
          <div className="relative z-10 mt-[106px] px-[200px]">
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {plans.map((plan) => {
                const isHighlight = !!plan.highlight;
                const baseCard =
                  "relative rounded-xl bg-white flex flex-col overflow-visible min-h-[600px] p-6 pb-12 border border-gray-200 shadow-sm";

                const handlePrimaryCTA =
                  plan.cta.toLowerCase().includes("contact")
                    ? goToCalendarThenDemo
                    : () => openRazorpay(plan.name);

                return (
                  <div
                    key={plan.name}
                    className={
                      isHighlight
                        ? `${baseCard.replace(
                            "border-gray-200",
                            "border-[#4D31EC]"
                          )} -translate-y-4 pt-16 px-6`
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
                    {isHighlight && (
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
                        <T as="span" variant="sub14" weight={600} className="text-white">
                          Recommended
                        </T>
                      </div>
                    )}

                    {/* header */}
                    <div className="flex flex-col items-center text-center min-h-[150px] justify-end">
                      <T as="h3" variant="sub20" weight={560} className="text-[#101828]">
                        {plan.name}
                      </T>

                      <div className="mt-3">
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

                    <button
                      type="button"
                      aria-label={plan.cta}
                      onClick={handlePrimaryCTA}
                      className="mt-5 mb-3 inline-flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#4D31EC] px-5 py-3 text-white hover:bg-[#4029c8] transition"
                    >
                      <T as="span" variant="sub14" weight={500}>
                        {plan.cta}
                      </T>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>

                    <ul className="mt-1 flex-1">
                      {plan.features.map((f, i) => {
                        const isValueRow = "value" in f;
                        const borderTop =
                          f.label === "Hiring support fee" ? "border-t border-gray-100" : "";
                        return (
                          <li key={i} className={`py-3 flex items-center justify-between ${borderTop}`}>
                            <T as="span" variant="sub14" weight={500} className="text-[#444953]">
                              {f.label}
                            </T>

                            {isValueRow ? (
                              <T as="span" variant="sub14" weight={500} className="text-black text-right">
                                {f.value}
                              </T>
                            ) : f.included ? (
                              <img src="/icons/hugeicons_tick-02.png" alt="Included" width={20} height={20} />
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
          </div>
        </div>
      </Section>

      {/* custom plan banner */}
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
            <T as="h2" variant="hero48" weight={540} className="text-[#101828]" autoLeading>
              Looking for a custom plan that suits your team?
            </T>

            <T as="p" variant="body16" weight={500} className="text-[#475467] mt-2">
              Get in touch with our sales team to develop a plan customized for your organization&apos;s needs.
            </T>
          </div>

          <button
            type="button"
            onClick={goToCalendarThenDemo}
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
          <T as="h2" variant="hero48" className="text-center mb-4 text-[#101828]" autoLeading>
            FAQs
          </T>

          <T as="p" variant="sub20" weight={400} lineHeightPx={27} trackingPct={3} className="text-center mb-10 text-black">
            Can’t find the answer you're looking for? Reach out to our support
          </T>

          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade my subscription mid-billing cycle?",
                a: "You can upgrade or downgrade anytime; your plan adjusts immediately with prorated billing.",
              },
              {
                q: "What happens to unused job credits or posting allowances?",
                a: "Unused credits roll over to the next month but expire at the end of the financial year.",
              },
              {
                q: "What is your cancellation and refund policy?",
                a: "Contact Sales or Customer Service; they’ll guide you based on your plan.",
              },
              {
                q: "Are taxes or additional fees applied?",
                a: "Prices exclude taxes; applicable taxes are added based on your billing region.",
              },
              {
                q: "Do you support custom or enterprise plans?",
                a: "Yes—contact Sales for a tailored quote.",
              },
            ].map(({ q, a }, i) => (
              <details key={i} className="group rounded-[12px] border border-gray-200 bg-white shadow-sm">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none">
                  <T as="span" variant="body16" weight={500} className="text-[#0F172A]">
                    {q}
                  </T>
                  <svg className="faq-chevron transition-transform duration-200" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 -mt-1">
                  <T as="p" variant="sub14" weight={500} className="text-gray-600">
                    {a}
                  </T>
                </div>
              </details>
            ))}
          </div>

          <style jsx>{`
            summary::-webkit-details-marker { display: none; }
            details[open] .faq-chevron { transform: rotate(180deg); }
          `}</style>
        </Container>
      </Section>

      <NewFooter />
    </main>
  );
}
