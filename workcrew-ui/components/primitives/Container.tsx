import * as React from "react";
import { container } from "@/styles/theme";

type Props = React.HTMLAttributes<HTMLDivElement>;

const Container = React.forwardRef<HTMLDivElement, Props>(({ className, ...props }, ref) => (
  <>
    <div ref={ref} className={`wc-container ${className ?? ""}`} {...props} />
    <style jsx>{`
      .wc-container { ${container()} }
    `}</style>
  </>
));
Container.displayName = "Container";
export default Container;
