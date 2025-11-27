// PATH: app/onboarding/Stepper.tsx
"use client";

import * as React from "react";

export type Step = { key: string; label: string };

type Props = {
  steps: Step[];
  active: number; // 0-based index of current step
  className?: string;
};

export default function Stepper({ steps, active, className }: Props) {
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = idx === active;
          const isCompleted = idx < active;

          const bubbleClasses = isActive
            ? "bg-[#4D31EC] text-white"
            : isCompleted
            ? "bg-[#CFC8FF] text-[#4D31EC]"
            : "bg-[#EEEAFE] text-gray-700";

          return (
            <React.Fragment key={s.key}>
              {/* step bubble + label */}
              <div
               className={[
                 "flex min-w-0 flex-1 flex-col items-center",
                 idx === 2 ? "-mt-[20px]" : "" // move only step 3 up
               ].join(" ")}
              >
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    bubbleClasses,
                  ].join(" ")}
                >
                  {idx + 1}
                </div>
                <div className="mt-3 w-full text-center text-xs text-gray-800">
                  {s.label}
                </div>
              </div>

              {/* connector between this and the next step */}
              {idx < steps.length - 1 && (
                <div className="mx-2 flex-1">
                  <div className="h-[2px] w-full rounded-full bg-[#E7E3FF] overflow-hidden flex items-center">
                    <div
                      className={`h-full transition-[width] duration-500 ease-out ${
                        isCompleted ? "w-full bg-[#4D31EC]" : "w-0 bg-[#4D31EC]"
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
