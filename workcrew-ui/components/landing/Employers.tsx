"use client";
import * as React from "react";
import { Section } from "../primitives";
import LogoMarquee from "./LogoMarquee";
import { usePathname } from "next/navigation";

type Props = {
  /** Show this section on the Home ("/") route? Default false. */
  enabledOnHome?: boolean;
  speed?: number;
  height?: number;
  repeat?: number;
};

const Employers: React.FC<Props> = ({
  enabledOnHome = false,
  speed = 22,
  height = 52,
  repeat = 32,
}) => {
  const pathname = usePathname();

  // Hide on home unless explicitly enabled
  if (pathname === "/" && !enabledOnHome) return null;

  return (
    <Section size="sm" background="default" withContainer={false}>
      <LogoMarquee speed={speed} height={height} repeat={repeat} />
    </Section>
  );
};

export default Employers;
