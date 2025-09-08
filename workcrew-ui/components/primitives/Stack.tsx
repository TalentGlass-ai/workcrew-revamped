import * as React from "react";

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: "row" | "column";
  gap?: number;                 // px
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
};

const map = {
  align: { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" },
  justify: {
    start: "flex-start", center: "center", end: "flex-end",
    between: "space-between", around: "space-around", evenly: "space-evenly",
  },
};

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ direction = "column", gap = 12, align = "start", justify = "start", wrap, className, ...props }, ref) => (
    <>
      <div ref={ref} className={`wc-stack ${className ?? ""}`} {...props} />
      <style jsx>{`
        .wc-stack {
          display: flex;
          flex-direction: ${direction};
          gap: ${gap}px;
          align-items: ${map.align[align]};
          justify-content: ${map.justify[justify]};
          flex-wrap: ${wrap ? "wrap" : "nowrap"};
        }
      `}</style>
    </>
  )
);
Stack.displayName = "Stack";
export default Stack;
