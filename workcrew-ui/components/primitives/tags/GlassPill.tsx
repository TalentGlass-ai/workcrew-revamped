"use client";

import React from "react";

/**
 * Reusable glass-effect pill component
 * Works with both:
 *  <GlassPill text="We’re here for a reason" />
 *  <GlassPill>who are we ?</GlassPill>
 *  <GlassPill iconColor="#2288FE" className="px-6">Custom text</GlassPill>
 */

interface GlassPillProps {
  /** Text content (optional if using children) */
  text?: string;
  /** Optional icon color */
  iconColor?: string;
  /** Optional custom class names */
  className?: string;
  /** Optional children as alternative to text */
  children?: React.ReactNode;
}

export default function GlassPill({
  text,
  iconColor = "#2288FE",
  className = "",
  children,
}: GlassPillProps) {
  const content = text || children;

  return (
    <span
      className={`
        relative inline-flex h-[40px] w-auto items-center justify-center gap-2 rounded-full
        bg-[#C3D7FF]/[0.28] backdrop-blur-[8px] px-4
        font-archivo font-medium text-[14px] tracking-[0.03em] text-black
        ${className}
      `}
    >
      {/* Icon (colored bolt) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px]"
        fill={iconColor}
        aria-hidden="true"
      >
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>

      <span>{content}</span>
    </span>
  );
}
