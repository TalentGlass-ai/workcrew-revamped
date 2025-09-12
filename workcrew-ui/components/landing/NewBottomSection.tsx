"use client";
import * as React from "react";
import { Section, Container, Heading, Text, Button } from "../primitives";

const NewBottomSection: React.FC = () => {
  return (
    <Section size="md" background="tinted">
      <Container>
        <Heading as={3}>What our users are saying</Heading>
        <Text>Testimonials and success stories from real candidates and teams.</Text>
        <div style={{height:12}}/>
        <Button variant="primary">Read our blogs</Button>
      </Container>
    </Section>
  );
};
export default NewBottomSection;
