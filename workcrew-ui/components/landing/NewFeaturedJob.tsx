"use client";
import * as React from "react";
import { Section, Container, Grid, Card,  Button, Badge } from "../primitives";
import { T } from "../primitives/Typography";

type Props = { setJobs?: (x:any[])=>void };

const NewFeaturedJob: React.FC<Props> = () => {
  const sample = [
    { title:"UX Designer", company:"Design Studio", location:"Bangalore", tags:["Figma","Prototyping"], cta:"Apply now" },
    { title:"Frontend Developer", company:"Creative Solutions", location:"Remote", tags:["React","CSS"], cta:"Apply now" }
  ];
  return (
    <Section size="lg" background="default">
      <Container>
        <T as="h2">Discover roles made for you!</T>
        <Grid cols={{ base:1, md:2 }} gap={16}>
          {sample.map((j, i)=>(
            <Card key={i} padding="lg">
              <T as="h4">{j.title}</T>
              <T variant="body" className="text-sm">{j.company}</T> 
              <div style={{height:8}}/>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {j.tags.map(t => <Badge key={t} tone="neutral" soft>{t}</Badge>)}
              </div>
              <div style={{height:12}}/>
              <Button>{j.cta}</Button>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};
export default NewFeaturedJob;
