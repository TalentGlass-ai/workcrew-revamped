"use client";
import * as React from "react";

type Tone = "primary" | "secondary" | "neutral" | "danger";
type Font = "regular" | "mono";
type Variant = "solid" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  font?: Font;
  variant?: Variant;   
  size?: Size;
};

const toneToBase: Record<Tone, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-slate-900 text-white hover:bg-black/90",
  neutral: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const variantToClasses: Record<Variant, string> = {
  solid: "", 
  outline: "bg-transparent border border-current",
  ghost: "bg-transparent",
  link: "bg-transparent underline underline-offset-4 p-0",
};

const sizeToClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  tone = "primary",
  font = "regular",
  variant = "solid",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    variant === "solid" ? toneToBase[tone] : variantToClasses[variant];

  const fontCls = font === "mono" ? "font-mono" : "font-medium";
  const sizeCls = sizeToClasses[size];

  const common =
    "inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button className={`${common} ${base} ${fontCls} ${sizeCls} ${className}`} {...rest}>
      {children}
    </button>
  );
}
