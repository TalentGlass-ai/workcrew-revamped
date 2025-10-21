"use client";

import React from "react";

type Size = "sm" | "md" | "lg";

export interface LayeredPillProps {
  /** Text inside the pill */
  label: string;
  /** Optional left icon (pass an SVG or any ReactNode) */
  icon?: React.ReactNode;
  /** Href: renders an anchor when provided; otherwise renders a button */
  href?: string;
  /** onClick handler (used when no href is provided) */
  onClick?: () => void;
  /** Visual size */
  size?: Size;
  /** Override colors (default match your current “More jobs” pill) */
  outerBg?: string;   // Tailwind classes, e.g. "bg-[#C3D7FF]/40"
  middleBg?: string;  // Tailwind classes, e.g. "bg-[#9DB6FF]/60"
  innerBg?: string;   // Tailwind classes, e.g. "bg-[#4D31EC]"
  /** Extra classNames for the root wrapper */
  className?: string;
  /** aria-label override (defaults to label) */
  ariaLabel?: string;
}

/**
 * Reusable 3-layer pill CTA (matches the “More jobs” styling).
 * Renders <a> when href is given; otherwise <button>.
 */
export default function LayeredPill({
  label,
  icon,
  href,
  onClick,
  size = "md",
  outerBg = "bg-[#C3D7FF]/40",
  middleBg = "bg-[#9DB6FF]/60",
  innerBg = "bg-[#4D31EC]",
  className = "",
  ariaLabel,
}: LayeredPillProps) {
  const sizes: Record<Size, { px: string; py: string; icon: string; text: string }> = {
    sm: { px: "px-5", py: "py-2.5", icon: "h-4 w-4", text: "text-[14px]" },
    md: { px: "px-8", py: "py-4",   icon: "h-5 w-5", text: "text-[16px]" },
    lg: { px: "px-10", py: "py-5",  icon: "h-6 w-6", text: "text-[18px]" },
  };

  const content = (
    <span className={`inline-flex rounded-full ${outerBg} p-2`}>
      <span className={`inline-flex rounded-full ${middleBg} p-1.5`}>
        <span
          className={[
            "inline-flex items-center gap-3 rounded-full",
            innerBg,
            sizes[size].px,
            sizes[size].py,
            "text-white",
            "transition hover:brightness-110 active:brightness-95",
          ].join(" ")}
        >
          {icon ? <span className={sizes[size].icon}>{icon}</span> : null}
          <span className={`font-archivo font-semibold tracking-[0.02em] whitespace-nowrap ${sizes[size].text}`}>
            {label}
          </span>
        </span>
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`inline-flex whitespace-nowrap ${className}`}
        aria-label={ariaLabel ?? label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex whitespace-nowrap ${className}`}
      aria-label={ariaLabel ?? label}
    >
      {content}
    </button>
  );
}
export function ArrowNortheastIcon() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}
