"use client";

import * as React from "react";

type Size = "sm" | "md" | "lg";
type Tone = "primary" | "white" | "indigo"; 
type As = "button" | "a";

export type GlowPillButtonProps = {
  as?: As;
  href?: string;
  children: React.ReactNode;
  className?: string;

  size?: Size;
  tone?: Tone;

  innerFill?: string;
  middleRingFill?: string;
  outerRingFill?: string;

  disabled?: boolean;

  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

const sizeVars: Record<Size, React.CSSProperties> = {
  sm: { ["--gpb-h" as any]: "42px", ["--gpb-pad" as any]: "18px", ["--gpb-radius" as any]: "21px" },
  md: { ["--gpb-h" as any]: "50px", ["--gpb-pad" as any]: "28px", ["--gpb-radius" as any]: "30px" },
  lg: { ["--gpb-h" as any]: "58px", ["--gpb-pad" as any]: "32px", ["--gpb-radius" as any]: "32px" },
};

const toneFill: Record<Tone, string> = {
  primary: "linear-gradient(135deg,#4D31EC 0%,#3B6AF7 100%)",
  indigo: "linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)",
  white: "#ffffff",
};

export default function GlowPillButton({
  as = "button",
  href,
  children,
  className = "",
  size = "md",
  tone = "primary",
  innerFill,
  middleRingFill = "#ffffff",
  outerRingFill = "rgba(196,211,239,.43)",
  disabled,
  type = "button",
  ...rest
}: GlowPillButtonProps) {
  const Comp = as as React.ElementType;

  const style: React.CSSProperties = {
    ...sizeVars[size],
    ["--gpb-inner" as any]: innerFill ?? toneFill[tone],
    ["--gpb-middle" as any]: middleRingFill,
    ["--gpb-outer" as any]: outerRingFill,
  };

  // manually build class string
  const classes = ["gpb"];
  if (disabled) classes.push("gpb--disabled");
  if (className) classes.push(className);

  return (
    <Comp
      href={as === "a" ? href : undefined}
      type={as === "button" ? type : undefined}
      aria-disabled={disabled || undefined}
      className={classes.join(" ")}
      style={style}
      {...rest}
    >
      {children}

      <style jsx>{`
        .gpb {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          height: var(--gpb-h);
          padding: 0 var(--gpb-pad);
          border-radius: var(--gpb-radius);

          border: 0;
          color: ${tone === "white" ? "#0b1020" : "#fff"};
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;

          /* inner pill */
          background: var(--gpb-inner);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.35),
            0 10px 28px rgba(61,79,255,0.25);
          z-index: 0;
        }

        /* middle white ring */
        .gpb::before {
          content: "";
          position: absolute;
          inset: -4.5px;
          border-radius: var(--gpb-radius);
          background: var(--gpb-middle);
          z-index: -1;
        }

        /* outer translucent ring */
        .gpb::after {
          content: "";
          position: absolute;
          inset: -8.5px;
          border-radius: var(--gpb-radius);
          background: var(--gpb-outer);
          z-index: -2;
        }

        .gpb--disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .gpb:active { transform: translateY(1px); }
        @media (hover:hover) {
          .gpb:hover { filter: brightness(1.02); }
        }
      `}</style>
    </Comp>
  );
}
