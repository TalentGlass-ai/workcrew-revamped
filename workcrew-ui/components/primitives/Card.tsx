import * as React from "react";
import { tokens } from "../../styles/tokens";
import { radius, shadow } from "../../styles/theme";


type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
  radiusLevel?: keyof typeof tokens.radii;
  elevation?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
};

const PAD = { none: 0, sm: 12, md: 16, lg: 24 } as const;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = "md", radiusLevel = "lg", elevation = "sm", bordered, ...props }, ref) => {
    return (
      <>
        <div
          ref={ref}
          className={`wc-card ${className ?? ""}`}
          {...props}
        >
          {children}
        </div>

        <style jsx>{`
          .wc-card {
            background: #fff;
            padding: ${PAD[padding]}px;
            border-radius: ${radius(radiusLevel)};
            ${elevation !== "none" ? `box-shadow: ${shadow(elevation)};` : ""}
            ${bordered ? `border: 1px solid ${tokens.colors.border};` : ""}
          }
        `}</style>
      </>
    );
  }
);

Card.displayName = "Card";
export default Card;
