/**
 * Test script for the Candidate Evaluation Engine
 *
 * This script demonstrates how to use the evaluation API endpoint.
 * Run this with: npx tsx test-evaluation.ts
 */

async function testEvaluation() {
  const testData = {
    candidateId: "test-candidate-id",
    jobId: "test-job-id"
  };

  try {
    const response = await fetch('http://localhost:3000/api/evaluation/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    const result = await response.json();
    console.log('Evaluation Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Example of how the evaluation result should look:
/*
{
  "fitScore": 85,
  "dimensions": {
    "skillsMatch": 90,
    "experienceLevel": 80,
    "educationFit": 50,
    "locationCompatibility": 95,
    "salaryExpectations": 70,
    "culturalFit": 75,
    "growthPotential": 60
  },
  "recommendation": "STRONG_HIRE",
  "insights": {
    "strengths": [
      "Excellent skills match with job requirements",
      "Strong experience level match",
      "Location compatibility"
    ],
    "gaps": [
      "Education level may not meet requirements"
    ],
    "risks": [
      "Salary expectations mismatch"
    ],
    "recommendations": [
      "Consider skills training or certification programs"
    ]
  },
  "graphEnrichment": {
    "skillGaps": ["advanced typescript", "react native"],
    "experienceGaps": ["3 years required"],
    "educationGaps": ["Bachelor's degree required"],
    "locationPreferences": ["New York", "Remote"],
    "salaryRange": { "min": 80000, "max": 120000 },
    "culturalIndicators": ["team player", "innovative", "collaborative"],
    "growthAreas": ["leadership", "mentoring", "technical architecture"]
  }
}
*/

if (require.main === module) {
  testEvaluation();
}