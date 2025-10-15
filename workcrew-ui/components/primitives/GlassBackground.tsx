"use client";
import * as React from "react";

/**
 * Gradient + (optional) grid + glass blur wrapper.
 * Use as a full-bleed background layer OR around a section/card.
 */
export default function GlassBackground({
  children,
  className = "",
  // Background gradient (very light grey-lavender to match your Figma)
  gradientFrom = "rgba(246,247,252,0.95)",
  gradientTo   = "rgba(236,239,248,0.92)",
  // Grid
  showGrid = true,
  gridColor = "rgba(163,157,255,0.18)", // #A39DFF @ ~18%
  gridSize  = 40,
  gridOpacity = 0.20,
  // Glass
  blurPx = 14,
  saturate = 140,
  // Border (set to '' if you don't want any)
  border = "",
  radius = 0, // can be number or string (e.g., "24px" or "9999px")
}: {
  children?: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showGrid?: boolean;
  gridColor?: string;
  gridSize?: number;
  gridOpacity?: number;
  blurPx?: number;
  saturate?: number;
  border?: string;
  radius?: number | string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        border,
        borderRadius: typeof radius === "number" ? `${radius}px` : radius,
        background: `linear-gradient(180deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        // glass
        backdropFilter: `blur(${blurPx}px) saturate(${saturate}%)`,
        WebkitBackdropFilter: `blur(${blurPx}px) saturate(${saturate}%)`,
      }}
    >
      {showGrid && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: gridOpacity,
            mixBlendMode: "soft-light",
            backgroundImage: `
              linear-gradient(${gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}
      {/* faint inner highlight like “inside stroke” */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
