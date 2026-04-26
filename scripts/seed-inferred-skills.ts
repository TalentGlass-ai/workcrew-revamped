import { getPrisma } from '../lib/prisma';
import { getSkillInferenceEngine } from '../lib/services/skill-inference-engine';

async function seedInferredSkills() {
  console.log('Starting inferred skills seeding...');

  const prisma = await getPrisma();
  if (!prisma) {
    console.error('Database connection not available');
    return;
  }

  const inferenceEngine = getSkillInferenceEngine();

  // Get all candidates with skills
  const candidates = await prisma.candidate.findMany({
    include: {
      skills: true
    },
    take: 10 // Limit for testing
  });

  console.log(`Processing ${candidates.length} candidates...`);

  for (const candidate of candidates) {
    try {
      console.log(`Processing candidate ${candidate.id}...`);
      const result = await inferenceEngine.inferSkillsForCandidate(candidate.id);
      console.log(`  Inferred ${result.totalInferred} skills (${result.highConfidenceCount} high confidence)`);
    } catch (error) {
      console.error(`Error processing candidate ${candidate.id}:`, error);
    }
  }

  console.log('Inferred skills seeding complete');
}

// Run the seeding
seedInferredSkills().catch(console.error);