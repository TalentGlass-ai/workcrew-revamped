This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Candidate Evaluation Engine

WorkCrew.ai includes a sophisticated AI-powered candidate evaluation engine that provides comprehensive fit analysis between candidates and job opportunities.

### Features

- **7-Dimensional Scoring**: Evaluates candidates across skills, experience, education, location, salary, culture, and growth potential
- **Weighted Algorithm**: Uses strategic weighting (30% skills, 25% experience, 15% education, etc.) for accurate fit assessment
- **Penalty System**: Applies penalties for critical gaps and red flags
- **Structured Insights**: Provides actionable recommendations, strengths, gaps, and risks
- **Graph Enrichment**: Generates data for enhancing candidate profiles with skill gaps, experience requirements, and growth areas

### API Usage

#### Evaluate Candidate Fit

```bash
POST /api/evaluation/evaluate
Content-Type: application/json

{
  "candidateId": "candidate-uuid",
  "jobId": "job-uuid"
}
```

**Response:**
```json
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
    "strengths": ["Excellent skills match", "Strong experience level"],
    "gaps": ["Education requirements"],
    "risks": ["Salary expectations mismatch"],
    "recommendations": ["Consider training programs"]
  },
  "graphEnrichment": {
    "skillGaps": ["typescript", "react"],
    "experienceGaps": ["3 years required"],
    "educationGaps": ["Bachelor's degree"],
    "locationPreferences": ["New York"],
    "salaryRange": { "min": 80000, "max": 120000 },
    "culturalIndicators": ["team player", "innovative"],
    "growthAreas": ["leadership", "mentoring"]
  }
}
```

### Recommendation Levels

- **STRONG_HIRE** (85+): Excellent fit, proceed with offer
- **CONSIDER** (70-84): Good fit with minor concerns
- **WEAK_FIT** (50-69): Moderate fit, requires careful consideration
- **NO_HIRE** (<50): Significant gaps, not recommended

### Testing

Run the test script to verify the evaluation engine:

```bash
npx tsx test-evaluation.ts
```

This will test the API endpoint and display a sample evaluation result.
   curl http://localhost:8108/health
   ```

3. **Sync data from database to Typesense:**
   ```bash
   npm run sync:typesense
   ```

### Environment Variables

Make sure your `.env` file contains the following Typesense configuration:

```env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

### Production Deployment

For production, use a managed Typesense service or deploy Typesense on your infrastructure. Update the environment variables accordingly.

### Search API

The search functionality is available via:
- `/api/jobs/search-typesense` - Advanced search with filtering
- `/api/sync-typesense` - Real-time data synchronization webhooks
