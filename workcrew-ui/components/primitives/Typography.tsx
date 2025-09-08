import * as React from "react";
import { text } from "../../styles/theme";
import { tokens } from "../../styles/tokens";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel;                     // 1..6
  color?: string;
  weight?: 400 | 500 | 600 | 700;
};

export const Heading: React.FC<HeadingProps> = ({
  as = 2,
  color = tokens.colors.gray[900],
  weight,
  children,
  className,
  ...props
}) => {
  const key = (`h${as}` as const);                    // "h1".."h6"
  const Tag = key as unknown as React.ElementType;    // <- no JSX namespace needed
  const base = text(key as any);

  return (
    <>
      <Tag className={`wc-heading ${className ?? ""}`} {...props}>
        {children}
      </Tag>
      <style jsx>{`
        .wc-heading {
          ${Object.entries(base)
            .map(([k, v]) => `${k}:${v};`)
            .join("")}
          color: ${color};
          ${weight ? `font-weight: ${weight};` : ""}
        }
      `}</style>
    </>
  );
};

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: "sm" | "md" | "lg";
  color?: string;
  weight?: 400 | 500 | 600 | 700;
  as?: React.ElementType;                              // span, p, div, etc.
};

export const Text: React.FC<TextProps> = ({
  variant = "md",
  color = tokens.colors.gray[700],
  weight,
  as = "p",
  children,
  className,
  ...props
}) => {
  const BaseTag = as as React.ElementType;
  const base = text(variant === "sm" ? "body-sm" : variant === "lg" ? "body-lg" : "body-md");

  return (
    <>
      <BaseTag className={`wc-text ${className ?? ""}`} {...props}>
        {children}
      </BaseTag>
      <style jsx>{`
        .wc-text {
          ${Object.entries(base)
            .map(([k, v]) => `${k}:${v};`)
            .join("")}
          color: ${color};
          ${weight ? `font-weight: ${weight};` : ""}
        }
      `}</style>
    </>
  );
};
