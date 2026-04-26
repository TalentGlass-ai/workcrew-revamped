import { getPrisma } from '../lib/prisma';
import { getAIRankingEngine } from '../lib/services/ai-ranking-engine';

async function batchRankJobs() {
  const prisma = await getPrisma();
  const rankingEngine = getAIRankingEngine();

  console.log('Starting batch job ranking...');

  // Get all published jobs that need ranking
  const jobs = await prisma.job.findMany({
    where: {
      status: 'published',
      // Only rank jobs that haven't been ranked in the last 24 hours
      // or have new candidates (simplified check)
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true
    }
  });

  console.log(`Found ${jobs.length} published jobs to rank`);

  let successCount = 0;
  let errorCount = 0;

  for (const job of jobs) {
    try {
      console.log(`Ranking candidates for job: ${job.title} (${job.id})`);

      const startTime = Date.now();
      const result = await rankingEngine.rankCandidatesForJob(job.id, 100);
      const duration = Date.now() - startTime;

      console.log(`✓ Ranked ${result.candidates.length} candidates in ${duration}ms`);

      successCount++;

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`✗ Failed to rank job ${job.id}:`, error);
      errorCount++;
    }
  }

  console.log(`\nBatch ranking complete:`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`Total: ${jobs.length}`);
}

async function rankSpecificJob(jobId: string) {
  const rankingEngine = getAIRankingEngine();

  console.log(`Ranking candidates for job: ${jobId}`);

  try {
    const startTime = Date.now();
    const result = await rankingEngine.rankCandidatesForJob(jobId, 100);
    const duration = Date.now() - startTime;

    console.log(`✓ Ranked ${result.candidates.length} candidates in ${duration}ms`);
    console.log(`Top candidate score: ${result.candidates[0]?.finalScore || 'N/A'}`);

  } catch (error) {
    console.error(`✗ Failed to rank job ${jobId}:`, error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'job' && args[1]) {
  // Rank specific job
  rankSpecificJob(args[1]);
} else if (command === 'all') {
  // Rank all jobs
  batchRankJobs();
} else {
  console.log('Usage:');
  console.log('  npm run rank:all          # Rank all published jobs');
  console.log('  npm run rank:job <jobId>  # Rank specific job');
  process.exit(1);
}