import * as React from "react";
import { container, sectionBg } from "../../styles/theme";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  size?: "sm" | "md" | "lg";
  background?: keyof typeof sectionBg; 
  withContainer?: boolean;
};

const padY = { sm: 40, md: 72, lg: 104 } as const;

const Section: React.FC<SectionProps> = ({
  as = "section",
  size = "md",
  background = "default",
  withContainer = true,
  children,
  className,
  ...props
}) => {
  const Tag = as as React.ElementType;
  return (
    <>
      <Tag className={`wc-section ${className ?? ""}`} {...props}>
        {withContainer ? <div className="container">{children}</div> : children}
      </Tag>
      <style jsx>{`
        .wc-section { background: ${sectionBg[background]}; padding: ${padY[size]}px 0; }
        .container { ${container()} }
      `}</style>
    </>
  );
};
export default Section;
