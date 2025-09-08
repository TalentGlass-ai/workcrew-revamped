"use client";
import * as React from "react";
import { Section, Container, Text } from "../primitives";
import { tokens } from "../../styles/tokens";

const NewFooter: React.FC = () => {
  return (
    <footer>
      <Section size="md" background="default" withContainer={false}>
        <div className="foot">
          <Container>
            <div className="grid">
              <div><Text color={tokens.colors.footerFg}>WorkCrew.ai</Text>
                <Text variant="sm" color={tokens.colors.gray[300]}>Connect with opportunities that match your ambitions.</Text>
              </div>
              <div><Text color="#fff">Contact</Text>
                <Text variant="sm" color={tokens.colors.gray[300]}>hello@workcrew.ai</Text>
                <Text variant="sm" color={tokens.colors.gray[300]}>+91 7975724363</Text>
              </div>
            </div>
          </Container>
        </div>
      </Section>
      <style jsx>{`
        .foot { background:${tokens.colors.footerBg}; color:${tokens.colors.footerFg}; }
        .grid { display:grid; gap:16px; grid-template-columns:1fr; }
        @media (min-width:768px){ .grid{ grid-template-columns:2fr 1fr; } }
      `}</style>
    </footer>
  );
};
export default NewFooter;
