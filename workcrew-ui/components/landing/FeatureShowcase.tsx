"use client";

import * as React from "react";
import { Section, Container, Heading, Text, Button, Card } from "../primitives";

export default function FeatureShowcase() {
  return (
    <Section>
      <Container>
        {/* Top heading */}
        <div className="text-center mb-12">
          <Text className="text-sm font-medium text-blue-600">
            ⚡ The WorkCrew.ai solution
          </Text>
          <Heading className="text-3xl font-bold mt-2">
            Here’s <span className="text-blue-500">how</span> we do it!
          </Heading>
          <Text className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We provide clarity, efficiency, and intelligence at every stage of
            the hiring process. Whether you are changing careers or expanding
            your team, we make each step simpler.
          </Text>
        </div>

        {/* Feature highlight box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-purple-600 text-white rounded-2xl p-10 shadow-lg items-center">
          {/* Left text */}
          <div>
            <Heading className="text-2xl font-semibold">
              Smart resume parsing
            </Heading>
            <Text className="mt-4 text-purple-100">
              AI smartly extracts and organizes your skills, experience, and
              achievements from any resume format.
            </Text>
          </div>

          {/* Right mockup */}
          <div className="flex flex-col items-center">
            <Card className="bg-white text-black w-full max-w-md p-6 rounded-xl shadow">
              <Heading className="text-lg font-semibold mb-4">
                Resume Parser
              </Heading>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                <p>📄 Upload Resume</p>
                <p className="text-sm text-gray-400">PDF, DOCX</p>
              </div>
            </Card>

            <Button className="mt-6 rounded-full px-6 py-3 bg-white text-purple-600 hover:bg-purple-100">
              ↗ Try it out
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
