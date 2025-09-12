"use client";

import Image from "next/image";
import React from "react";

export default function NewFooter() {
  return (
    <footer className="px-4 py-12 md:py-16">
      {/* Outer panel: 1280 × 529 on md+, dark slate */}
      <div className="mx-auto max-w-[1280px] rounded-md border border-white/10 bg-[#444953] md:h-[529px]">
        <div className="grid grid-cols-1 gap-10 px-6 py-10 text-white md:grid-cols-5 md:gap-8 md:px-10 md:py-12">
          {/* 1) Brand + tagline */}
          <div className="flex flex-col">
            <div className="mb-4 text-xs/none text-white/80">
              Product of TalentBox Labs
            </div>

            {/* Logo 158×36 (from Figma) */}
            <div className="mb-4">
              {/* Replace with your real logo path */}
              <Image
                src="/logo.png"
                alt="WorkCrew.ai"
                width={158}
                height={36}
                className="h-[36px] w-[158px] object-contain"
              />
            </div>

            <p className="max-w-[260px] text-[13px] leading-5 text-white/80">
              Connect with opportunities that match your ambitions. <br />
              Your dream job awaits.
            </p>

            {/* Copyright bottom on desktop */}
            <div className="mt-auto hidden text-[12px] text-white/60 md:block">
              © 2023, All rights Reserved
            </div>
          </div>

          {/* 2) For job seekers */}
          <FooterCol
            title="For job seekers"
            items={["Browse jobs", "One click apply", "Resume builder"]}
          />

          {/* 3) For recruiters */}
          <FooterCol
            title="For recruiters"
            items={["Post jobs", "Find candidates", "Pricing", "Hiring solutions"]}
          />

          {/* 4) WorkCrew.ai */}
          <FooterCol
            title="WorkCrew.ai"
            items={["About us", "Blogs", "Terms and conditions", "Help desk", "Query post"]}
          />

          {/* 5) Contact + social */}
          <div className="flex flex-col">
            <FooterLabel>Contact</FooterLabel>

            <div className="mt-3 space-y-3 text-[14px] leading-[23px] tracking-[0.03em] text-white/90">
              <FooterRow icon={<MailIcon />}>
                <a href="mailto:hello@workcrew.ai" className="hover:opacity-90">
                  hello@workcrew.ai
                </a>
                <br />
                <a href="mailto:sales@workcrew.ai" className="hover:opacity-90">
                  sales@workcrew.ai
                </a>
              </FooterRow>

              <FooterRow icon={<PhoneIcon />}>
                <a href="tel:+919785724383" className="hover:opacity-90">
                  +91 9785724383
                </a>
              </FooterRow>

              <FooterRow icon={<LocationIcon />}>
                Sector 2, HSR Layout, <br />
                Bengaluru, Karnataka 560102
              </FooterRow>
            </div>

            {/* Social icons row (≈18.75×18.75) */}
            <div className="mt-6 flex items-center gap-4">
              <SocialLink ariaLabel="Instagram" href="#">
                <InstagramIcon />
              </SocialLink>
              <SocialLink ariaLabel="X" href="#">
                <XIcon />
              </SocialLink>
              <SocialLink ariaLabel="Facebook" href="#">
                <FacebookIcon />
              </SocialLink>
              <SocialLink ariaLabel="Telegram" href="#">
                <TelegramIcon />
              </SocialLink>
              <SocialLink ariaLabel="LinkedIn" href="#">
                <LinkedInIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Copyright on mobile */}
        <div className="px-6 pb-6 text-[12px] text-white/60 md:hidden">
          © 2023, All rights Reserved
        </div>
      </div>
    </footer>
  );
}

/* ---------------- helpers ---------------- */

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col">
      <FooterLabel>{title}</FooterLabel>
      <ul className="mt-3 space-y-2 text-[14px] leading-[23px] tracking-[0.03em] text-white/90">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="hover:opacity-90">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLabel({ children }: { children: React.ReactNode }) {
  // Headings ~16px, SemiBold
  return <h4 className="text-[16px] font-semibold">{children}</h4>;
}

function FooterRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-[2px] text-white/80">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function SocialLink({
  href,
  ariaLabel,
  children,
}: {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="grid size-[18.75px] place-items-center text-white/90 hover:text-white"
    >
      {children}
    </a>
  );
}

/* ---------------- icons (18–20px) ---------------- */

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16v12H4z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.9 19.9 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.9 19.9 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.12a2 2 0 0 1 2.11-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h3.8l5.1 6.9L18.6 3H21l-7.2 8.2L21 21h-3.8l-5.4-7.3L7 21H3l7.8-9.1L3 3z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 10h3V7h-3V6a1 1 0 0 1 1-1h2V2h-3a4 4 0 0 0-4 4v1H8v3h2v9h3v-9z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.5 3.5L2.9 10.4c-1 .4-1 1.8.1 2.1l4.5 1.4 1.7 5c.3 1 1.7 1.1 2.1.1l2.6-5.4 5.1-8.9c.5-.9-.4-1.8-1.5-1.3z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 9h3v9H6zM7.5 6A1.5 1.5 0 1 1 7.5 3a1.5 1.5 0 0 1 0 3zM11 9h3v1.3c.6-.9 1.6-1.6 3-1.6 2.3 0 4 1.6 4 4.9V18h-3v-3.7c0-1.6-.6-2.6-2-2.6-1.2 0-1.9.8-2.2 1.6-.1.2-.1.6-.1.9V18h-3V9z" />
    </svg>
  );
}
