"use client";

import * as React from "react";
import type { JSX as ReactJSX, ElementType, CSSProperties } from "react";

/** Allow any intrinsic HTML tag (works even if TS couldn't auto-globally find JSX) */
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
  | "altButton";

type TProps = React.HTMLAttributes<HTMLElement> & {
  as?: TagName;
  children: React.ReactNode;
  className?: string;
  font?: "display" | "sans" | "alt";
  /** 540 uses the .font-540 helper; other numeric weights go inline style */
  weight?: number;
  /** convenience for your % letter-spacing tokens */
  trackingPct?: 1 | 2 | 3;
  variant?: Variant;
};

/** Base classes by variant (align these with your Tailwind tokens) */
const baseByVariant: Record<Variant, string> = {
  heroTitle: "font-display text-h1 leading-h1 tracking-tight1pct",
  h1: "font-display text-h1 leading-h1 tracking-tight1pct",
  h2: "font-display text-h2 leading-h2 tracking-tight1pct",
  h3: "font-display text-h3 leading-h3 tracking-tight1pct",
  bodyLg: "font-sans text-body leading-body tracking-wide3pct",
  body: "font-sans text-base leading-relaxed tracking-1pct",
  button: "font-sans text-btn leading-none tracking-wide2pct font-semibold",
  chip: "font-sans text-chip leading-none tracking-wide3pct font-medium",
  altButton: "font-alt text-btn leading-none tracking-wide2pct font-semibold",
};


function cx(...vals: Array<string | false | null | undefined>) {
  return vals.filter(Boolean).join(" ");
}

/** choose..sensible default tag ....for each var... */
function defaultTagForVariant(v: Variant): TagName {
  switch (v) {
    case "heroTitle":
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
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
  ...rest
}: TProps) {
  const tag: ElementType = (as ?? defaultTagForVariant(variant)) as ElementType;

  const classes = cx(
    baseByVariant[variant],
    font === "display" && "font-display",
    font === "sans" && "font-sans",
    font === "alt" && "font-alt",
    weight === 540 && "font-540", // relies  globals.css helper
    trackingPct === 1 && "tracking-1pct",
    trackingPct === 2 && "tracking-2pct",
    trackingPct === 3 && "tracking-3pct",
    className
  );

  const mergedStyle: CSSProperties = {
    ...(style || {}),
    ...(weight && weight !== 540 ? { fontWeight: weight } : {}),
  };

  
  return React.createElement(tag, { className: classes, style: mergedStyle, ...rest }, children);
}

