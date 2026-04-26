import { getPrisma } from '../lib/prisma';
import { getAIRankingEngine } from '../lib/services/ai-ranking-engine';

async function testRankingEngine() {
  const prisma = await getPrisma();
  const rankingEngine = getAIRankingEngine();

  console.log('🧪 Testing AI Ranking Engine...\n');

  // Create a test organization
  const org = await prisma.organization.create({
    data: {
      name: 'Test Corp',
      slug: `test-corp-${Date.now()}`
    }
  });

  // Create test users
  const recruiter = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `recruiter-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Recruiter'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `candidate1-${Date.now()}@test.com`,
      firstName: 'John',
      lastName: 'Developer'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `candidate2-${Date.now()}@test.com`,
      firstName: 'Jane',
      lastName: 'Engineer'
    }
  });

  // Create a test job
  const job = await prisma.job.create({
    data: {
      organizationId: org.id,
      title: 'Senior Backend Engineer',
      description: 'Looking for experienced backend engineer with Java and microservices',
      requiredSkills: ['Java', 'Spring Boot', 'Microservices'],
      preferredSkills: ['Kafka', 'Docker', 'AWS'],
      skillClusters: ['Backend Engineer'],
      experienceRequired: '5+ years',
      status: 'published',
      createdBy: recruiter.id
    }
  });

  // Create test candidates
  const candidate1 = await prisma.candidate.create({
    data: {
      userId: user1.id,
      profileSummary: 'Experienced Java developer',
      totalExperience: 7,
      currentRole: 'Senior Backend Engineer',
      primarySkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
      skillClusters: ['Backend Engineer']
    }
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      userId: user2.id,
      profileSummary: 'Fullstack developer',
      totalExperience: 4,
      currentRole: 'Fullstack Engineer',
      primarySkills: ['JavaScript', 'React', 'Node.js'],
      skillClusters: ['Fullstack Engineer']
    }
  });

  // Add skills to candidates
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candidate1.id, skillName: 'Java', score: 90 },
      { candidateId: candidate1.id, skillName: 'Spring Boot', score: 85 },
      { candidateId: candidate1.id, skillName: 'Microservices', score: 80 },
      { candidateId: candidate1.id, skillName: 'Kafka', score: 75 },
      { candidateId: candidate2.id, skillName: 'JavaScript', score: 88 },
      { candidateId: candidate2.id, skillName: 'React', score: 85 },
      { candidateId: candidate2.id, skillName: 'Node.js', score: 80 }
    ]
  });

  // Add inferred skills
  await prisma.inferredSkill.createMany({
    data: [
      {
        candidateId: candidate1.id,
        skillName: 'Docker',
        confidence: 0.75,
        reason: 'Strong correlation with Microservices and Kafka',
        inferenceType: 'CO_OCCURRENCE'
      },
      {
        candidateId: candidate2.id,
        skillName: 'Java',
        confidence: 0.65,
        reason: 'Node.js developers often know Java',
        inferenceType: 'ROLE_BASED'
      }
    ]
  });

  console.log('📝 Created test data:');
  console.log(`  - Job: ${job.title} (${job.id})`);
  console.log(`  - Candidates: ${candidate1.id}, ${candidate2.id}\n`);

  // Run ranking
  console.log('🚀 Running AI Ranking Engine...');
  const result = await rankingEngine.rankCandidatesForJob(job.id, 10);

  console.log(`\n✅ Ranking completed in ${result.processingTime}ms`);
  console.log(`📊 Found ${result.candidates.length} ranked candidates\n`);

  // Display results
  console.log('🏆 RANKING RESULTS:');
  result.candidates.forEach((candidate, index) => {
    console.log(`\n${index + 1}. Candidate ${candidate.candidateId}`);
    console.log(`   Score: ${candidate.finalScore}/100`);
    console.log(`   Recommendation: ${candidate.recommendation}`);
    console.log(`   Score Breakdown:`);
    console.log(`     - Skill Match: ${(candidate.scoreBreakdown.skillMatch * 100).toFixed(1)}%`);
    console.log(`     - Skill Depth: ${(candidate.scoreBreakdown.skillDepth * 100).toFixed(1)}%`);
    console.log(`     - Inferred Boost: ${(candidate.scoreBreakdown.inferredSkillBoost * 100).toFixed(1)}%`);
    console.log(`     - Experience Fit: ${(candidate.scoreBreakdown.experienceFit * 100).toFixed(1)}%`);
    console.log(`     - Cluster Match: ${(candidate.scoreBreakdown.clusterMatch * 100).toFixed(1)}%`);
    console.log(`     - Stability: ${(candidate.scoreBreakdown.stability * 100).toFixed(1)}%`);

    console.log(`   Analysis:`);
    console.log(`     - Strong Skills: ${candidate.analysis.strongSkills.join(', ') || 'None'}`);
    console.log(`     - Missing Skills: ${candidate.analysis.missingSkills.join(', ') || 'None'}`);
    console.log(`     - Inferred Skills: ${candidate.analysis.inferredSkills.map(s => `${s.name} (${(s.confidence * 100).toFixed(0)}%)`).join(', ') || 'None'}`);
    console.log(`     - Role Fit: ${candidate.analysis.roleFit}`);
  });

  // Verify stored results
  const storedMatches = await prisma.jobCandidateMatch.findMany({
    where: { jobId: job.id },
    orderBy: { score: 'desc' }
  });

  console.log(`\n💾 Stored ${storedMatches.length} matches in database`);

  // Cleanup
  await prisma.jobCandidateMatch.deleteMany({ where: { jobId: job.id } });
  await prisma.inferredSkill.deleteMany({ where: { candidateId: { in: [candidate1.id, candidate2.id] } } });
  await prisma.candidateSkill.deleteMany({ where: { candidateId: { in: [candidate1.id, candidate2.id] } } });
  await prisma.candidate.deleteMany({ where: { id: { in: [candidate1.id, candidate2.id] } } });
  await prisma.job.delete({ where: { id: job.id } });
  await prisma.user.deleteMany({ where: { id: { in: [recruiter.id, user1.id, user2.id] } } });
  await prisma.organization.delete({ where: { id: org.id } });

  console.log('\n🧹 Test data cleaned up');
  console.log('\n🎉 AI Ranking Engine test completed successfully!');
}

testRankingEngine().catch(console.error);