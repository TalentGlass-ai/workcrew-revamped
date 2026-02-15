import * as React from "react";
import { tokens } from "@/styles/tokens";
import { text, radius } from "@/styles/theme";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  soft?: boolean; // filled vs soft background
  leftIcon?: React.ReactNode;
};

const palette = (tone: Tone, soft: boolean) => {
  const t = {
    brand:   { bg: tokens.colors.primary, fg: tokens.colors.primaryFg, softBg: "rgba(77,49,236,.1)", softFg: tokens.colors.primary },
    neutral: { bg: tokens.colors.gray[800], fg: "#fff", softBg: tokens.colors.gray[100], softFg: tokens.colors.gray[800] },
    success: { bg: tokens.colors.success, fg: "#0B3417", softBg: "rgba(34,197,94,.14)", softFg: tokens.colors.success },
    warning: { bg: tokens.colors.warning, fg: "#5A4300", softBg: "rgba(250,204,21,.18)", softFg: tokens.colors.warning },
    danger:  { bg: tokens.colors.danger,  fg: "#4A0D0D", softBg: "rgba(239,68,68,.14)", softFg: tokens.colors.danger },
  }[tone];
  return soft ? { bg: t.softBg, fg: t.softFg, border: "transparent" } : { bg: t.bg, fg: t.fg, border: "transparent" };
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ tone="neutral", soft=true, leftIcon, className, children, ...props }, ref) => {
  const colors = palette(tone, soft);
  return (
    <>
      <span ref={ref} className={`wc-badge ${className ?? ""}`} {...props}>
        {leftIcon ? <span className="icon" aria-hidden="true">{leftIcon}</span> : null}
        <span className="label">{children}</span>
      </span>
      <style jsx>{`
        .wc-badge {
          ${Object.entries(text("body-sm")).map(([k, v]) => `${k}:${v};`).join("")}
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: ${radius("pill")};
          background: ${colors.bg}; color: ${colors.fg}; border: 1px solid ${colors.border};
          white-space: nowrap;
        }
        .icon { display:inline-flex; }
      `}</style>
    </>
  );
});
Badge.displayName = "Badge";
export default Badge;
