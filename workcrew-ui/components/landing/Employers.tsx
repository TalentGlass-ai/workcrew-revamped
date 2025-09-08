"use client";
import * as React from "react";
import { Section, Container, Grid, Card, Text } from "../primitives";

type Props = { jobs?: any[] };

const Employers: React.FC<Props> = () => {
  return (
    <Section size="md" background="default">
      <Container>
        <Grid cols={{ base:2, md:4, lg:6 }} gap={16}>
          {["azul","linarc","canpepus","azul","linarc","canpepus"].map((n,i)=>(
            <Card key={i} padding="sm" elevation="none" bordered>
              <Text as="span">{n.toUpperCase()}</Text>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};
export default Employers;
