"use client";
import * as React from "react";
import { Section, Container, Button } from "../primitives";
import { T } from "../primitives/Typography";


const NewBottomSection: React.FC = () => {
  return (
    <Section size="md" background="tinted">
      <Container>
        <T as="h3">What our users are saying</T>
        <T>Testimonials and success stories from real candidates and teams.</T>
        <div style={{height:12}}/>
        <Button variant="solid" tone="primary">Read our blogs</Button>
      </Container>
    </Section>
  );
};
export default NewBottomSection;
