// PATH: workcrew-ui/components/landing/NewFooter.tsx
"use client";

/**
 * NewFooter
 * ----------
 * - Zero outer spacing — the parent section controls inter-section gaps
 * - Uses our Typography primitive (T) for all textual elements
 * - Archivo presets enforced (per spec):
 *    • Top caption: Medium 16 / auto / 2%
 *    • Blurb + list + contact: Medium 14 / 23 / 3%
 *    • Bottom copyright (single line, bottom-left): Semibold 14 / 23 / 0%
 * - Accessible links (keyboard focus rings), no inline styles
 */

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import T from "../primitives/Typography";

/* --------------------------------------------
   Link & contact config — pure data (no UI)
--------------------------------------------- */
type FooterItem =
  | { label: string; href: string; smart?: undefined }
  | { label: string; smart: "browseJobs" | "resumeBuilder"; href?: undefined };

const footerLinks = {
  seekers: [
    { label: "Browse jobs", smart: "browseJobs" } as FooterItem,
    { label: "Resume builder", smart: "resumeBuilder" } as FooterItem,
  ],
  recruiters: [
    { label: "Post jobs", href: "/signup" } as FooterItem,
    { label: "Find candidates", href: "#" } as FooterItem,
    { label: "Pricing", href: "/pricing" } as FooterItem,
  ],
  company: [
    { label: "About us", href: "/about" } as FooterItem,
    { label: "Blogs", href: "https://blog.workcrew.ai/" } as FooterItem,
    { label: "Terms and conditions", href: "#" } as FooterItem,
  ],
  socials: {
    instagram: "https://www.instagram.com/workcrew.ai/",
    x: "https://x.com/Workcrew_ai",
    facebook: "https://www.facebook.com/workcrewai/",
    linkedin: "https://www.linkedin.com/company/workcrew/",
    telegram: "https://t.me/workcrew_ai",
  },
  contact: {
    email1: "hello@workcrew.ai",
    email2: "sales@workcrew.ai",
    phone: "+91 9785724383",
    whatsapp: "https://wa.me/917676161689",
    addressText: "Sector 2, HSR Layout, Bengaluru, Karnataka 560102",
  },
};

/* -----------------------
   Auth helpers (client)
------------------------ */
function getIsAuthed(): boolean {
  try {
    const lsToken =
      typeof window !== "undefined" &&
      (localStorage.getItem("wc_token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token"));
    const hasCookie =
      typeof document !== "undefined" &&
      /(?:^|;\s*)wc_auth=/.test(document.cookie);
    return Boolean(lsToken || hasCookie);
  } catch {
    return false;
  }
}

/* -----------------------
   Footer root component
------------------------ */
export default function NewFooter(): React.ReactElement {
  return (
    <footer className="relative !my-0 !py-0">
      <div className="w-full border-t border-white/10 bg-[#444953] md:h-[529px]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-10 text-white md:grid-cols-5 md:gap-8 md:px-10 md:py-12">
          {/* =============================
              Brand block
          ============================== */}
          <div className="flex flex-col">
            {/* Archivo Medium 16 / auto / 2% */}
            <T
              as="p"
              variant="body16"
              className="mb-4 text-white/80 text-[16px] leading-normal tracking-[0.02em] font-medium"
            >
              Product of TalentBox Labs
            </T>

            {/* Logo → home */}
            <div className="mb-4">
              <Link
                href="/"
                aria-label="Go to homepage"
                className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <Image
                  src="/logo.png"
                  alt="WorkCrew.ai"
                  width={158}
                  height={36}
                  className="h-[36px] w-[158px] object-contain"
                />
              </Link>
            </div>

            {/* Blurb — Archivo Medium 14 / 23 / 3% (single line) */}
            <T
              as="p"
              variant="body16"
              className="max-w-[520px] text-white/80 text-[14px] leading-[23px] tracking-[0.03em] font-medium"
            >
              Connect with opportunities that match your ambitions. Your dream job awaits.
            </T>
          </div>

          {/* =============================
              Navigation columns
          ============================== */}
          <nav aria-label="Footer" className="contents">
            <FooterCol title="For job seekers" items={footerLinks.seekers} />
            <FooterCol title="For recruiters" items={footerLinks.recruiters} />
            <FooterCol title="WorkCrew.ai" items={footerLinks.company} />
          </nav>

          {/* =============================
              Contact + Socials
          ============================== */}
          <div className="flex flex-col">
            {/* Section label can remain as-is; spec targeted top caption + blurb + copyright */}
            <SectionLabel>Contact</SectionLabel>

            <div className="mt-3 space-y-3">
              {/* Contact rows — Archivo Medium 14 / 23 / 3% */}
              <FooterRow icon={<MailIcon />}>
                <T as="p" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
                  <a
                    href={`mailto:${footerLinks.contact.email1}`}
                    className="hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    {footerLinks.contact.email1}
                  </a>
                  <br />
                  <a
                    href={`mailto:${footerLinks.contact.email2}`}
                    className="hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    {footerLinks.contact.email2}
                  </a>
                </T>
              </FooterRow>

              <FooterRow icon={<PhoneIcon />}>
                <T as="p" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
                  <a
                    href={`tel:${footerLinks.contact.phone.replace(/\s+/g, "")}`}
                    className="hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    {footerLinks.contact.phone}
                  </a>
                </T>
              </FooterRow>

              <FooterRow icon={<WhatsAppIcon />}>
                <T as="p" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
                  <a
                    href={footerLinks.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    +91 7676161689
                  </a>
                </T>
              </FooterRow>

              <FooterRow icon={<LocationIcon />}>
                <T as="p" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
                  {footerLinks.contact.addressText
                    .split(", ")
                    .map((chunk, i, arr) => (
                      <React.Fragment key={i}>
                        {chunk}
                        {i < arr.length - 1 ? ", " : ""}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                </T>
              </FooterRow>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <SocialLink ariaLabel="Instagram" href={footerLinks.socials.instagram}>
                <InstagramIcon />
              </SocialLink>
              <SocialLink ariaLabel="X" href={footerLinks.socials.x}>
                <XIcon />
              </SocialLink>
              <SocialLink ariaLabel="Facebook" href={footerLinks.socials.facebook}>
                <FacebookIcon />
              </SocialLink>
              <SocialLink ariaLabel="Telegram" href={footerLinks.socials.telegram}>
                <TelegramIcon />
              </SocialLink>
              <SocialLink ariaLabel="LinkedIn" href={footerLinks.socials.linkedin}>
                <LinkedInIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Bottom-left single-line copyright — Archivo Semibold 14 / 23 / 0% */}
        <div className="mx-auto max-w-[1280px] px-6 pb-6 md:px-10">
          <T
            as="p"
            variant="body16"
            className="whitespace-nowrap text-white/60 text-[14px] leading-[23px] tracking-[0em] font-semibold"
          >
            © 2023, All rights Reserved
          </T>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------------------
   Column (title + link list)
--------------------------------------------- */
function FooterCol({
  title,
  items,
}: {
  title: string;
  items: FooterItem[];
}) {
  return (
    <div className="flex flex-col">
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <FooterItemLink item={it} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------
   Footer item renderer — normal vs smart link
--------------------------------------------- */
function FooterItemLink({ item }: { item: FooterItem }) {
  const router = useRouter();
  const linkCls =
    "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  if ("href" in item && item.href) {
    const isExternal = item.href.startsWith("http");
    return (
      <T as="span" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
        {isExternal ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
            {item.label}
          </a>
        ) : (
          <Link href={item.href} className={linkCls}>
            {item.label}
          </Link>
        )}
      </T>
    );
  }

  const onSmartClick = () => {
    const authed = getIsAuthed();

    if (item.smart === "browseJobs") {
      if (authed) router.push("/find-jobs");
      else router.push("/login?redirect=/find-jobs");
      return;
    }

    if (item.smart === "resumeBuilder") {
      const uploadPath = "/resume/upload";
      if (authed) router.push(uploadPath);
      else router.push(`/login?redirect=${encodeURIComponent(uploadPath)}`);
      return;
    }
  };

  return (
    <T as="button" variant="body16" className="text-[14px] leading-[23px] tracking-[0.03em] font-medium">
      <button
        type="button"
        onClick={onSmartClick}
        className={linkCls}
        aria-label={item.label}
      >
        {item.label}
      </button>
    </T>
  );
}

/* --------------------------------------------
   Section label (h4 semantics)
   (stays consistent; spec didn’t change this one)
--------------------------------------------- */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <T
      as="h4"
      variant="body16"
      className="text-[16px] leading-[23px] tracking-[0.03em] font-semibold"
    >
      {children}
    </T>
  );
}

/* --------------------------------------------
   Icon row (glyph + content)
--------------------------------------------- */
function FooterRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-[2px] text-white/80" aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}

/* --------------------------------------------
   Social link with consistent focus behavior
--------------------------------------------- */
function SocialLink({
  href,
  ariaLabel,
  children,
}: {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  const className =
    "grid size-[18.75px] place-items-center text-white/90 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  return isExternal ? (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  ) : (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
}

/* --------------------------------------------
   Icons — inherit currentColor
--------------------------------------------- */
function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 6h16v12H4z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.9 19.9 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.9 19.9 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.12a2 2 0 0 1 2.11-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16.04 2.9A13.05 13.05 0 0 0 3 15.95a12.9 12.9 0 0 0 1.77 6.56L3 29l6.67-1.74a13.1 13.1 0 0 0 6.37 1.62h.01A13.03 13.03 0 0 0 29 15.83 12.98 12.98 0 0 0 16.04 2.9zm6.92 18.9c-.29.8-1.73 1.52-2.4 1.61-.62.1-1.41.14-2.27-.14-.52-.17-1.18-.38-2.03-.74-3.56-1.55-5.88-5.16-6.06-5.41-.17-.25-1.45-1.93-1.45-3.68 0-1.75.91-2.61 1.23-2.97.32-.36.7-.46.93-.46.23 0 .46 0 .66.01.21.01.5-.08.79.6.29.69 1 2.37 1.08 2.54.09.17.14.37.02.61-.12.24-.18.39-.36.59-.18.2-.37.44-.53.59-.18.18-.37.38-.16.74.21.36.94 1.54 2.01 2.49 1.38 1.23 2.55 1.61 2.91 1.78.36.17.57.15.78-.09.21-.24.89-1.04 1.12-1.4.23-.36.47-.3.79-.18.32.12 2.04.96 2.39 1.13.35.17.58.26.67.41.09.15.09.87-.2 1.67z" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg
      width="18.75"
      height="18.75"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h3.8l5.1 6.9L18.6 3H21l-7.2 8.2L21 21h-3.8l-5.4-7.3L7 21H3l7.8-9.1L3 3z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 10h3V7h-3V6a1 1 0 0 1 1-1h2V2h-3a4 4 0 0 0-4 4v1H8v3h2v9h3v-9z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.5 3.5L2.9 10.4c-1 .4-1 1.8.1 2.1l4.5 1.4 1.7 5c.3 1 1.7 1.1 2.1.1l2.6-5.4 5.1-8.9c.5-.9-.4-1.8-1.5-1.3z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="18.75" height="18.75" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 9h3v9H6zM7.5 6A1.5 1.5 0 1 1 7.5 3a1.5 1.5 0 0 1 0 3zM11 9h3v1.3c.6-.9 1.6-1.6 3-1.6 2.3 0 4 1.6 4 4.9V18h-3v-3.7c0-1.6-.6-2.6-2-2.6-1.2 0-1.9.8-2.2 1.6-.1.2-.1.6-.1.9V18h-3V9z" />
    </svg>
  );
}
