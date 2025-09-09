"use client";
import * as React from "react";
import { Section } from "../primitives";
import LogoMarquee from "./LogoMarquee";

type Props = { jobs?: any[] };

const Employers: React.FC<Props> = () => {
  return (
    //  spacing can match of the page
    <Section size="sm" background="default" withContainer={false}>
      <LogoMarquee speed={22} />
    </Section>
  );
};

export default Employers;
