"use client";
import * as React from "react";

type Variant = "hero" | "feature" | "soft";

type BaseProps = {
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: string;
  grid?: boolean;
  gridColor?: string;
  gridSize?: number;
  gridOpacity?: number;
  blurPx?: number;
  className?: string;
};

type Props = BaseProps & { variant?: Variant };

const PRESETS: Record<Variant, BaseProps> = {
  hero: {
    gradientFrom: "rgba(246,247,252,0.95)",
    gradientTo: "rgba(236,239,248,0.92)",
    gradientAngle: "180deg",
    grid: true,
    gridColor: "rgba(163,157,255,0.25)",
    gridSize: 40,
    gridOpacity: 0.30,
    blurPx: 0,
  },
  feature: {
    // STRONGER, clearly visible on white pages
    gradientFrom: "rgba(233,235,255,0.60)",
    gradientTo: "rgba(219,224,255,0.60)",
    gradientAngle: "180deg",
    grid: true,
    gridColor: "rgba(91,75,255,0.45)",
    gridSize: 40,
    gridOpacity: 1,
    blurPx: 2,
  },
  soft: {
    gradientFrom: "rgba(255,255,255,1)",
    gradientTo: "rgba(246,248,255,1)",
    gradientAngle: "180deg",
    grid: false,
    gridColor: "rgba(0,0,0,0.08)",
    gridSize: 32,
    gridOpacity: 0.2,
    blurPx: 0,
  },
};

export default function SectionBackdrop({
  variant = "hero",
  gradientFrom,
  gradientTo,
  gradientAngle,
  grid,
  gridColor,
  gridSize,
  gridOpacity,
  blurPx,
  className = "",
}: Props) {
  const p = { ...PRESETS[variant], gradientFrom, gradientTo, gradientAngle, grid, gridColor, gridSize, gridOpacity, blurPx };

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 z-0 ${className}`}>
      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${p.gradientAngle}, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`,
        }}
      />
      {/* Grid */}
      {p.grid && (
        <div
          className="absolute inset-0"
          style={{
            opacity: p.gridOpacity,
            backgroundImage: `
              linear-gradient(${p.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${p.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${p.gridSize}px ${p.gridSize}px`,
          }}
        />
      )}
      {/* Optional blur */}
      {p.blurPx && p.blurPx > 0 && (
        <div className="absolute inset-0" style={{ backdropFilter: `blur(${p.blurPx}px)` }} />
      )}
    </div>
  );
}
