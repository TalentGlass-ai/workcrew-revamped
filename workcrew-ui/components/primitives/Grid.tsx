import * as React from "react";
import { mq } from "@/styles/theme";


type ResponsiveCols = { base?: number; md?: number; lg?: number; xl?: number };

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: ResponsiveCols; // e.g { base:1, md:2, lg:3 }
  gap?: number;          // px
};

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = { base: 1, md: 2, lg: 3 }, gap = 16, className, ...props }, ref) => (
    <>
      <div ref={ref} className={`wc-grid ${className ?? ""}`} {...props} />
      <style jsx>{`
        .wc-grid {
          display: grid;
          grid-template-columns: repeat(${cols.base ?? 1}, minmax(0, 1fr));
          gap: ${gap}px;
        }
        ${cols.md ? `${mq("md")} { .wc-grid { grid-template-columns: repeat(${cols.md}, minmax(0,1fr)); } }` : ""}
        ${cols.lg ? `${mq("lg")} { .wc-grid { grid-template-columns: repeat(${cols.lg}, minmax(0,1fr)); } }` : ""}
        ${cols.xl ? `${mq("xl")} { .wc-grid { grid-template-columns: repeat(${cols.xl}, minmax(0,1fr)); } }` : ""}
      `}</style>
    </>
  )
);
Grid.displayName = "Grid";
export default Grid;
