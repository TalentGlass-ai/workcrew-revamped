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
  | "statLabel"
  /* ---- Added spec-friendly variants (non-breaking) ---- */
  | "hero48"      // Schibsted Grotesk, 48, ls 1%
  | "sub20"       // Archivo, 20,  ls 3%  (27px line-height typical)
  | "body16"      // Archivo, 16,  ls 3%  (22px line-height typical)
  | "sub14"       // Archivo, 14,  ls 3%  (pills)
  | "card36";     // Schibsted Grotesk, 36, ls 1%

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

  /** Convenience for % letter-spacing tokens (supports -1%, 1%, 2%, 3%) */
  trackingPct?: -1 | 1 | 2 | 3;

  /** Which preset to use */
  variant?: Variant;

  /** Override the default 20px line gap if needed (ignored if lineHeightPx is set) */
  lineGapPx?: number;

  /** Set an exact line-height (e.g., 27 for 27px). This overrides gap logic. */
  lineHeightPx?: number;

  /** If true, do not set line-height at all (let CSS natural/utility classes take over). */
  autoLeading?: boolean;
};

/* TOKENS */

const TOKENS = {
  font: {
    schibsted: "font-sans",  // map Tailwind "font-sans" to Schibsted
    archivo: "font-alt",     // map Tailwind "font-alt" to Archivo
  },
  track: {
    [-1]: "tracking-[-0.01em]",
    [1]: "tracking-[0.01em]",
    [2]: "tracking-[0.02em]",
    [3]: "tracking-[0.03em]",
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

  /* Added */
  hero48:    48,
  sub20:     20,
  body16:    16,
  sub14:     14,
  card36:    36,
};

/* VARIANTS (role-based) */
/* Note: colors are intentionally neutral; pass text colors via className when needed. */

const baseByVariant: Record<Variant, string> = {
  /* Headings — Schibsted */
  heroTitle: "font-sans text-[2.5rem] tracking-[0.01em] font-540",
  h1:        "font-sans text-[2.5rem] tracking-[0.01em] font-540",
  h2:        "font-sans text-[2rem]   tracking-[0.01em] font-540",
  h3:        "font-sans text-[3rem]   tracking-[0.01em] font-540",

  /* Body — Schibsted (kept for backwards compat) */
  bodyLg:    "font-sans text-[1.25rem] tracking-[0.03em]",
  body:      "font-sans text-[1rem]    tracking-[0.01em]",

  /* UI bits — Archivo */
  button:    "font-alt text-[1rem]     tracking-[0.02em] font-semibold",
  chip:      "font-alt text-[0.875rem] tracking-[0.03em] font-medium",
  altButton: "font-alt text-[1rem]     tracking-[0.02em] font-semibold",

  /* Supporting text — Schibsted */
  sub:       "font-sans text-[1.25rem] tracking-[0.03em] font-medium",
  cap:       "font-sans text-[1rem]    tracking-[0.03em] font-medium uppercase",

  /* Stats */
  statNumber:"font-sans text-[1.25rem] tracking-[0.01em] font-540 text-black",
  statLabel: "font-sans text-[0.875rem] tracking-[0.03em] font-medium",

  /* ---- Added spec-friendly variants ---- */

  // Schibsted Grotesk, 48, ls 1% (default medium; override via weight prop)
  hero48:    "font-sans text-[48px] tracking-[0.01em] font-medium",

  // Archivo, 20, ls 3% (typ. 27px line-height -> pass lineHeightPx={27} where needed)
  sub20:     "font-alt text-[20px] tracking-[0.03em] font-medium",

  // Archivo, 16, ls 3% (typ. 22px line-height -> pass lineHeightPx={22})
  body16:    "font-alt text-[16px] tracking-[0.03em]",

  // Archivo, 14, ls 3% (good for pills/chips)
  sub14:     "font-alt text-[14px] tracking-[0.03em] font-medium",

  // Schibsted Grotesk, 36, ls 1% (card titles)
  card36:    "font-sans text-[36px] tracking-[0.01em] font-medium",
};

function cx(...vals: Array<string | false | null | undefined>) {
  return vals.filter(Boolean).join(" ");
}

/** Sensible default tag per variant */
function defaultTagForVariant(v: Variant): TagName {
  switch (v) {
    case "heroTitle":
    case "h1":
    case "hero48":
      return "h1";
    case "h2":
    case "card36":
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
  lineHeightPx,
  autoLeading,
  ...rest
}: TProps) {
  const tag: ElementType = (as ?? defaultTagForVariant(variant)) as ElementType;

  const classes = cx(
    baseByVariant[variant],
    font && TOKENS.font[font],
    weight === 540 && "font-540",
    (trackingPct !== undefined && trackingPct !== null) ? TOKENS.track[trackingPct] : "",
    className
  );

  // Decide line-height strategy:
  // 1) Explicit px if provided
  // 2) No line-height if autoLeading
  // 3) Default "gap" (base font px + lineGapPx)
  const computedLineHeight =
    typeof lineHeightPx === "number"
      ? `${lineHeightPx}px`
      : autoLeading
      ? undefined
      : `${(FONT_PX[variant] ?? 16) + lineGapPx}px`;

  const mergedStyle: CSSProperties = {
    ...(computedLineHeight ? { lineHeight: computedLineHeight } : {}),
    ...(style || {}),
    ...(weight && weight !== 540 ? { fontWeight: weight } : {}),
  };

  return React.createElement(tag, { className: classes, ...rest, style: mergedStyle }, children);
}

export default T;
