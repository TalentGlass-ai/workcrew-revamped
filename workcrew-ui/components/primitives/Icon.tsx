import * as React from "react";

type IconProps = React.SVGAttributes<SVGElement> & {
  size?: number;       // px
  stroke?: number;     // px
  title?: string;      // a11y title
};

// Wrapper for inline SVG children or a path-render prop
const Icon: React.FC<IconProps & { children?: React.ReactNode }> = ({
  size = 20, stroke = 1.75, title, children, className, ...props
}) => {
  const titleId = React.useId();
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      role={title ? "img" : "presentation"} aria-labelledby={title ? titleId : undefined}
      className={className} {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {/* example fallback glyph if no children passed */}
      {children ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
};
export default Icon;
