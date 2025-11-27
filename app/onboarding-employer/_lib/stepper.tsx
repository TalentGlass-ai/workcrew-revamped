"use client";
import * as React from "react";

export type Step = { key: string; label: string };

export const EMP_STEPS: Step[] = [
  { key: "company", label: "Company details" },
  { key: "contact", label: "Contact information" },
  { key: "verify",  label: "Verification" },
];

function Connector({ filled, animate=false }: { filled:boolean; animate?:boolean }) {
  const [grow, setGrow] = React.useState(filled);
  React.useEffect(() => {
    if (filled || animate) {
      const id = requestAnimationFrame(() => setGrow(true));
      return () => cancelAnimationFrame(id);
    }
    setGrow(false);
  }, [filled, animate]);

  return (
    <div className="mx-2 h-1 flex-1 -mt-[21px] overflow-hidden rounded-full bg-gray-200">
      <div className={`h-full transition-[width] duration-500 ease-out ${grow ? "w-full bg-[#4D31EC]" : "w-0 bg-[#4D31EC]"}`} />
    </div>
  );
}

export function OnboardStepper({
  steps, active, advancing,
}: { steps: Step[]; active: number; advancing?: boolean }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((s, i) => {
          const isDone = i < active;
          const isCurrent = i === active;
          return (
            <React.Fragment key={s.key}>
              <div className="flex shrink-0 basis-[88px] flex-col items-center">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
                    isDone ? "bg-[#4D31EC] text-white" : "",
                    isCurrent ? "bg-white ring-2 ring-[#4D31EC] text-[#4D31EC]" : "",
                    !isDone && !isCurrent ? "bg-white ring-1 ring-gray-300 text-gray-400" : "",
                  ].join(" ")}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="mt-2 w-[88px] text-center text-[12px] font-medium text-gray-700 md:text-sm">
                  {s.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <Connector filled={i < active} animate={advancing && i === active} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
