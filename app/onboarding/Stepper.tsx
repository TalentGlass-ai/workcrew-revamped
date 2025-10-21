// PATH: workcrew-ui/components/onboarding/Stepper.tsx
"use client";

import * as React from "react";

export type Step = { key: string; label: string };

type Props = {
  steps: Step[];
  active: number; // 0-based index of the active step
  className?: string;
};

export default function Stepper({ steps, active, className }: Props) {
  return (
    <div className={["relative w-full", className].filter(Boolean).join(" ")}>
      {/* connector line through the center of circles */}
      <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#E7E3FF]" />

      <div className="relative z-10 flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = idx === active;
          const isCompleted = idx < active;
          const bubbleClasses = isActive
            ? "bg-[#4D31EC] text-white"
            : isCompleted
            ? "bg-[#CFC8FF] text-[#4D31EC]"
            : "bg-[#EEEAFE] text-gray-700";

        return (
          <div key={s.key} className="flex flex-1 min-w-0 flex-col items-center">
            {/* circle */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${bubbleClasses}`}>
              {idx + 1}
            </div>
            {/* label */}
            <div className="mt-3 text-center text-xs text-gray-800">{s.label}</div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
