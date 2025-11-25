"use client";

import * as React from "react";
import type { JSX as ReactJSX, ElementType, CSSProperties } from "react";

/* we let this accept any normal html tag (h1, p, span, etc) */
export type TagName = keyof ReactJSX.IntrinsicElements;

/* all our reusable typography presets — so ppl can just call <T variant="h2" /> instead of retyping classes */
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
  /* spec-friendly variants */
  | "hero48"      // Schibsted Grotesk, 48px, ls 1%
  | "sub20"       // Archivo, 20px,  ls 3%
  | "body18"      // Archivo, 18px,  ls 3%
  | "body16"      // Archivo, 16px,  ls 3%
  | "body14"      // Archivo, 14px,  ls 3% (NEW → for labels, placeholders)
  | "sub14"       // Archivo, 14px,  ls 3%
  | "card36"      // Schibsted Grotesk, 36px, ls 1%
  | "title28"     // Schibsted Grotesk, 28px, ls 1%
  | "title24";    // Archivo, 24px,   ls 3%  (for review names)

/* props accepted by <T> */
type TProps = React.HTMLAttributes<HTMLElement> & {
  as?: TagName;
  children: React.ReactNode;
  className?: string;

  /* restrict to only our 2 font families */
  font?: "schibsted" | "archivo";

  /**
   * weight override if u ever need custom weight.
   * if u pass 540 -> we apply our own .font-540 util (defined in globals.css)
   * any other number -> goes inline as fontWeight
   */
  weight?: number;

  /* quick way to apply our % letter-spacing tokens (-1%, 1%, 2%, 3%) */
  trackingPct?: -1 | 1 | 2 | 3;

  /* which variant to use (defaults to bodyLg) */
  variant?: Variant;

  /* tweak line-gap if needed (we add this to base font size unless u pass lineHeightPx) */
  lineGapPx?: number;

  /* directly set line-height in px if u know exact value */
  lineHeightPx?: number;

  /* if true, we skip line-height completely and let CSS utilities take over */
  autoLeading?: boolean;
};

/* ------------------ */
/* design tokens here */
/* ------------------ */
const TOKENS = {
  font: {
    schibsted: "font-sans",  // tailwind alias for Schibsted Grotesk
    archivo: "font-alt",     // tailwind alias for Archivo
  },
  track: {
    [-1]: "tracking-[-0.01em]",
    [1]: "tracking-[0.01em]",
    [2]: "tracking-[0.02em]",
    [3]: "tracking-[0.03em]",
  } as const,
} as const;

/* base font sizes (px) */
const FONT_PX: Record<Variant, number> = {
  heroTitle: 40,
  h1:        40,
  h2:        32,
  h3:        48,
  bodyLg:    20,
  body:      16,
  button:    16,
  chip:      14,
  altButton: 16,
  sub:       20,
  cap:       16,
  statNumber:20,
  statLabel: 14,

  hero48:    48,
  sub20:     20,
  body18:    18,
  body16:    16,
  body14:    14,   // new addition
  sub14:     14,
  card36:    36,
  title28:   28,
  title24:   24,
};

/* default line-heights (px) for consistency across variants */
const DEFAULT_LH_PX: Partial<Record<Variant, number>> = {
  hero48: 59,
  sub20: 27,
  body18: 24,
  body16: 23,
  body14: 21,  // default for labels / small body
  sub14: 23,
  card36: 44,
  title28: 34,
  title24: 23,
};

/* ------------------ */
/* base class mapping */
/* ------------------ */
const baseByVariant: Record<Variant, string> = {
  /* headings (Schibsted) */
  heroTitle: "font-sans text-[2.5rem] tracking-[0.01em] font-540",
  h1:        "font-sans text-[2.5rem] tracking-[0.01em] font-540",
  h2:        "font-sans text-[2rem]   tracking-[0.01em] font-540",
  h3:        "font-sans text-[3rem]   tracking-[0.01em] font-540",

  /* body (legacy) */
  bodyLg:    "font-sans text-[1.25rem] tracking-[0.03em]",
  body:      "font-sans text-[1rem]    tracking-[0.01em]",

  /* ui texts (Archivo) */
  button:    "font-alt text-[1rem]     tracking-[0.02em] font-semibold",
  chip:      "font-alt text-[0.875rem] tracking-[0.03em] font-medium",
  altButton: "font-alt text-[1rem]     tracking-[0.02em] font-semibold",

  /* supporting/sub (Schibsted) */
  sub:       "font-sans text-[1.25rem] tracking-[0.03em] font-medium",
  cap:       "font-sans text-[1rem]    tracking-[0.03em] font-medium uppercase",

  /* stat */
  statNumber:"font-sans text-[1.25rem] tracking-[0.01em] font-540 text-black",
  statLabel: "font-sans text-[0.875rem] tracking-[0.03em] font-medium",

  /* spec variants (Archivo + Schibsted blend) */
  hero48:    "font-sans text-[48px] tracking-[0.01em] font-medium",
  sub20:     "font-alt text-[20px] tracking-[0.03em] font-medium",
  body18:    "font-alt text-[18px] tracking-[0.03em]",
  body16:    "font-alt text-[16px] tracking-[0.03em]",
  body14:    "font-alt text-[14px] tracking-[0.03em]",      // new smaller body variant
  sub14:     "font-alt text-[14px] tracking-[0.03em] font-medium",
  card36:    "font-sans text-[36px] tracking-[0.01em] font-medium",
  title28:   "font-sans text-[28px] tracking-[0.01em] font-medium",
  title24:   "font-alt text-[24px] tracking-[0.03em] font-semibold",
};

/* ------------------ */
/* helper: class merge */
/* ------------------ */
function cx(...vals: Array<string | false | null | undefined>) {
  return vals.filter(Boolean).join(" ");
}

/* choose sensible default tag for each variant */
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
    case "title28":
    case "title24":
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

/* ------------------ */
/* main Typography component */
/* ------------------ */
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
    trackingPct !== undefined ? TOKENS.track[trackingPct] : "",
    className
  );

  // Resolve line-height:
  // 1) explicit lineHeightPx wins,
  // 2) autoLeading skips setting,
  // 3) variant default (if any),
  // 4) fallback: font px + lineGapPx
  const fallbackLH = `${(FONT_PX[variant] ?? 16) + lineGapPx}px`;
  const defaultVariantLH = DEFAULT_LH_PX[variant]
    ? `${DEFAULT_LH_PX[variant]}px`
    : undefined;

  const computedLineHeight =
    typeof lineHeightPx === "number"
      ? `${lineHeightPx}px`
      : autoLeading
      ? undefined
      : defaultVariantLH ?? fallbackLH;

  const mergedStyle: CSSProperties = {
    ...(computedLineHeight ? { lineHeight: computedLineHeight } : {}),
    ...(style || {}),
    ...(weight && weight !== 540 ? { fontWeight: weight } : {}),
  };

  /* render dynamically with correct semantic tag */
  return React.createElement(tag, { className: classes, ...rest, style: mergedStyle }, children);
}

export default T;
