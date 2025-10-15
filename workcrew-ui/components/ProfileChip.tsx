"use client";

import Image from "next/image";
import React from "react";

type Props = {
  /** Diameter of the avatar image (without the ring), default 45px */
  size?: number;
  /** Image source, default to your lady avatar */
  src?: string;
  alt?: string;

  /** Float the chip in a corner (optional) */
  floating?: boolean;
  /** Side when floating */
  side?: "left" | "right";
  /** Offsets in px when floating */
  offsetX?: number;
  offsetY?: number;

  /** Optional className passthrough if you need extra styling */
  className?: string;
};

export default function ProfileChip({
  size = 45,
  src = "/laptopLadyOnCard.png",
  alt = "Profile",
  floating = false,
  side = "right",
  offsetX = 16,
  offsetY = 22,
  className = "",
}: Props) {
  // ring thickness
  const ring = 6; // px
  const outer = size + ring * 2;

  const chip = (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: outer, height: outer }}
    >
      {/* Purple gradient ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg, #6E58FF, #4D31EC 40%, #6E58FF 80%, #8B7BFF)",
          filter: "saturate(120%)",
        }}
      />

      {/* Inner white separator */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          padding: ring,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(250,250,255,0.7) 100%)",
          WebkitMask:
            "radial-gradient(transparent calc(100% - 1px), #000 calc(100% - 0px))",
          mask: "radial-gradient(transparent calc(100% - 1px), #000 calc(100% - 0px))",
        }}
      />

      {/* Avatar */}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="relative z-[1] rounded-full object-cover shadow-sm"
        priority
      />

      {/* Soft outer glow */}
      <div
        className="absolute -z-10 rounded-full"
        style={{
          width: outer + 16,
          height: outer + 16,
          boxShadow: "0 8px 24px rgba(77, 49, 236, 0.35)",
        }}
      />
    </div>
  );

  if (!floating) return chip;

  // Use inline styles for positioning so we don't rely on dynamic Tailwind classes.
  const posStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 20,
    pointerEvents: "auto",
    bottom: offsetY,
    ...(side === "left" ? { left: offsetX } : { right: offsetX }),
  };

  return <div style={posStyle}>{chip}</div>;
}
