import * as React from "react";
import { tokens } from "../../styles/tokens";
import { text, shadow, radius } from "../../styles/theme";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const SIZES = { sm: { h: 40, px: 14, gap: 8 }, md: { h: 50, px: 20, gap: 10 }, lg: { h: 56, px: 24, gap: 12 } } as const;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children, className, variant = "primary", size = "md", fullWidth, loading, disabled, leftIcon, rightIcon, ...props
}, ref) => {
  const sz = SIZES[size];
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: tokens.colors.primary, fg: tokens.colors.primaryFg, border: "transparent" },
    secondary: { bg: tokens.colors.gray[50], fg: tokens.colors.gray[800], border: tokens.colors.border },
    ghost: { bg: "transparent", fg: tokens.colors.primary, border: "transparent" },
  }[variant];

  return (
    <>
      <button
        ref={ref}
        className={`wc-btn ${variant} ${size} ${fullWidth ? "full" : ""} ${className ?? ""}`}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className="inner">
          {leftIcon ? <span className="icon left">{leftIcon}</span> : null}
          <span className="label">{children}</span>
          {rightIcon ? <span className="icon right">{rightIcon}</span> : null}
          {loading ? (
            <span className="spinner" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" role="img">
                <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M21.5 12a9.5 9.5 0 0 1-9.5 9.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          ) : null}
        </span>
      </button>

      <style jsx>{`
        .wc-btn {
          ${Object.entries(text("button")).map(([k, v]) => `${k}:${v};`).join("")}
          display: inline-flex; align-items: center; justify-content: center;
          gap: ${sz.gap}px; height: ${sz.h}px; padding: 0 ${sz.px}px;
          width: ${fullWidth ? "100%" : "auto"};
          border-radius: ${radius("xxl")}; /* if you added xxl:30 in tokens; else hardcode 30px */
          border: 1px solid ${palette.border};
          background: ${palette.bg}; color: ${palette.fg};
          box-shadow: ${shadow("md")}; cursor: pointer; user-select: none;
          transition: transform 40ms ease, box-shadow 200ms ease, filter 120ms ease, background 120ms ease;
          position: relative;
        }
        .wc-btn.secondary, .wc-btn.ghost { box-shadow: none; }
        .wc-btn:hover:not(:disabled) { filter: brightness(0.96); }
        .wc-btn:active:not(:disabled) { transform: translateY(1px) scale(0.995); }
        .wc-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(77,49,236,.35); }
        .wc-btn:disabled { opacity: .6; cursor: not-allowed; }
        .inner { display: inline-flex; align-items: center; gap: ${sz.gap}px; }
        .icon { display: inline-flex; align-items: center; }
        .icon.left { margin-right: 2px; } .icon.right { margin-left: 2px; }
        .label { white-space: nowrap; }
        .spinner { display: inline-flex; margin-left: 8px; }
      `}</style>
    </>
  );
});
Button.displayName = "Button";
export default Button;
