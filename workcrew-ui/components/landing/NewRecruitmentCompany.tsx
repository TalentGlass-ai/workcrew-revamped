"use client";
import * as React from "react";
import { Section, Container, Heading, Text, Card, Button } from "../primitives";

const NewRecruitmentCompany = () => {
  return (
    <Section size="lg" background="subtle">
      <Container>
        <Heading as={2}>Here’s <span style={{fontWeight:700}}>how</span> we do it!</Heading>
        <Text style={{marginTop:8, marginBottom:24}}>
          We provide clarity, efficiency, and intelligence at every stage of hiring.
        </Text>
        <div className="row">
          <Card padding="lg"><Heading as={4}>Smart resume parsing</Heading><Text variant="sm">Upload resume &rarr; extract skills.</Text><div style={{height:12}}/><Button>Try it out</Button></Card>
          <Card padding="lg"><Heading as={4}>Screen for quality</Heading><Text variant="sm">Assessment backed profiles.</Text></Card>
        </div>
      </Container>
      <style jsx>{`
        .row{ display:grid; gap:16px; grid-template-columns:1fr; }
        @media (min-width:1024px){ .row{ grid-template-columns:1fr 1fr; } }
      `}</style>
    </Section>
  );
};
export default NewRecruitmentCompany;
