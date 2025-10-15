"use client";

import * as React from "react";
import type { JSX as ReactJSX, ElementType, CSSProperties } from "react";

/** Allow any intrinsic HTML tag */
export type TagName = keyof ReactJSX.IntrinsicElements;

/** Visual presets you can use everywhere */
export type Variant =
  | "heroTitle"
  | "h1"
  | "h2"
  | "h3"
  | "bodyLg"
  | "body"
  | "button"
  | "chip"
  | "altButton"
  | "sub"
  | "cap"
  | "statNumber"
  | "statLabel";

type TProps = React.HTMLAttributes<HTMLElement> & {
  as?: TagName;
  children: React.ReactNode;
  className?: string;

  /** Family: restrict to your two fonts */
  font?: "schibsted" | "archivo";

  /**
   * Optional weight override.
   * If you pass 540 we apply your .font-540 utility (keep it in globals.css).
   * Any other numeric value applies inline style fontWeight.
   */
  weight?: number;

  /** Convenience for % letter-spacing tokens */
  trackingPct?: 1 | 2 | 3; // 1% / 2% / 3%

  /** Which preset to use */
  variant?: Variant;

  /** Override the default 20px line gap if needed */
  lineGapPx?: number;
};

/* -------------------- TOKENS -------------------- */

const TOKENS = {
  font: {
    schibsted: "font-sans",  // map Tailwind "font-sans" to Schibsted
    archivo: "font-alt",     // map Tailwind "font-alt" to Archivo
  },
  track: {
    1: "tracking-[0.01em]",
    2: "tracking-[0.02em]",
    3: "tracking-[0.03em]",
  } as const,
} as const;

/* Each variant's base font-size in px (match the text-[...] you use) */
const FONT_PX: Record<Variant, number> = {
  heroTitle: 40, // 2.5rem
  h1:        40, // 2.5rem
  h2:        32, // 2rem
  h3:        48, // 3rem
  bodyLg:    20, // 1.25rem
  body:      16, // 1rem
  button:    16, // 1rem
  chip:      14, // 0.875rem
  altButton: 16, // 1rem
  sub:       20, // 1.25rem
  cap:       16, // 1rem
  statNumber:20, // 1.25rem
  statLabel: 14, // 0.875rem
};

/* -------------------- VARIANTS (role-based) -------------------- */
/* Note: colors are intentionally neutral; pass text colors via className when needed. */

const baseByVariant: Record<Variant, string> = {
  /* Headings — Schibsted */
  heroTitle: `${TOKENS.font.schibsted} text-[2.5rem] ${TOKENS.track[1]} font-540`,
  h1:        `${TOKENS.font.schibsted} text-[2.5rem] ${TOKENS.track[1]} font-540`,
  h2:        `${TOKENS.font.schibsted} text-[2rem]   ${TOKENS.track[1]} font-540`,
  h3:        `${TOKENS.font.schibsted} text-[3rem]   ${TOKENS.track[1]} font-540`,

  /* Body — Schibsted */
  bodyLg:    `${TOKENS.font.schibsted} text-[1.25rem] ${TOKENS.track[3]}`,
  body:      `${TOKENS.font.schibsted} text-[1rem]    ${TOKENS.track[1]}`,

  /* UI bits — Archivo */
  button:    `${TOKENS.font.archivo}   text-[1rem]     ${TOKENS.track[2]} font-semibold`,
  chip:      `${TOKENS.font.archivo}   text-[0.875rem] ${TOKENS.track[3]} font-medium`,
  altButton: `${TOKENS.font.archivo}   text-[1rem]     ${TOKENS.track[2]} font-semibold`,

  /* Supporting text — Schibsted */
  sub:       `${TOKENS.font.schibsted} text-[1.25rem] ${TOKENS.track[3]} font-medium`,
  cap:       `${TOKENS.font.schibsted} text-[1rem]    ${TOKENS.track[3]} font-medium uppercase`,

  /* Stats */
  statNumber:`${TOKENS.font.schibsted} text-[1.25rem] ${TOKENS.track[1]} font-540 text-black`,
  statLabel: `${TOKENS.font.schibsted} text-[0.875rem] ${TOKENS.track[3]} font-medium`,
};

function cx(...vals: Array<string | false | null | undefined>) {
  return vals.filter(Boolean).join(" ");
}

/** Sensible default tag per variant */
function defaultTagForVariant(v: Variant): TagName {
  switch (v) {
    case "heroTitle":
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "button":
    case "chip":
    case "altButton":
    case "statLabel":
      return "span";
    case "statNumber":
      return "div";
    default:
      return "p";
  }
}

export function T({
  as,
  children,
  className,
  variant = "bodyLg",
  font,
  weight,
  trackingPct,
  style,
  lineGapPx = 20,
  ...rest
}: TProps) {
  const tag: ElementType = (as ?? defaultTagForVariant(variant)) as ElementType;

  const classes = cx(
    baseByVariant[variant],
    font && TOKENS.font[font],
    weight === 540 && "font-540",
    trackingPct && TOKENS.track[trackingPct],
    className
  );

  const computedLineHeight = `${(FONT_PX[variant] ?? 16) + lineGapPx}px`;

  const mergedStyle: CSSProperties = {
    lineHeight: computedLineHeight, // enforce 20px line gap by default
    ...(style || {}),
    ...(weight && weight !== 540 ? { fontWeight: weight } : {}),
  };

  // style last so it wins over any class-based leading set in ...rest
  return React.createElement(tag, { className: classes, ...rest, style: mergedStyle }, children);
}
