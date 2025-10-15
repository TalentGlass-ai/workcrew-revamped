"use client";
import * as React from "react";
import { T } from "./Typography";

type StatProps = {
  number: React.ReactNode;
  label: React.ReactNode;
  className?: string;
  numberWeight?: 300 | 400 | 500 | 540 | 600; // optional override
};

export function Stat({ number, label, className, numberWeight = 400 }: StatProps) {
  return (
    <div className={className}>
      <T variant="statNumber" weight={numberWeight}>{number}</T>
      <T variant="statLabel">{label}</T>
    </div>
  );
}
