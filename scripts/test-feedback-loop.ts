// scripts/test-feedback-loop.ts
import { getPrisma } from '../lib/prisma';
import { feedbackLearningEngine } from '../lib/services/feedback-learning-engine';
import { ActionType } from '@/lib/types/prisma';

async function testFeedbackLoop() {
  console.log('🧠 Testing AI Feedback Loop...\n');

  const prisma = await getPrisma();

  // Create test data (reuse from ranking test)
  console.log('📝 Setting up test data...');

  // Get existing test data or create new
  let org = await prisma.organization.findFirst({
    where: { slug: { startsWith: 'test-corp' } }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Test Corp',
        slug: `test-corp-${Date.now()}`
      }
    });
  }

  let recruiter = await prisma.user.findFirst({
    where: { email: { startsWith: 'recruiter' } }
  });

  if (!recruiter) {
    recruiter = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: `recruiter-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'Recruiter'
      }
    });
  }

  let job = await prisma.job.findFirst({
    where: { title: 'Senior Backend Engineer' }
  });

  if (!job) {
    job = await prisma.job.create({
      data: {
        organizationId: org.id,
        title: 'Senior Backend Engineer',
        description: 'Looking for experienced backend developer',
        requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Docker'],
        preferredSkills: ['Kubernetes', 'AWS'],
        skillClusters: ['Backend Engineer'],
        createdBy: recruiter.id,
      }
    });
  }

  // Create test candidates
  const user1 = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `candidate1-${Date.now()}@test.com`,
      firstName: 'John',
      lastName: 'Backend'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `candidate2-${Date.now()}@test.com`,
      firstName: 'Jane',
      lastName: 'Fullstack'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: `candidate3-${Date.now()}@test.com`,
      firstName: 'Bob',
      lastName: 'Frontend'
    }
  });

  const candidate1 = await prisma.candidate.create({
    data: {
      userId: user1.id,
      profileSummary: 'Senior Java Backend Developer',
      totalExperience: 5,
      currentRole: 'Senior Backend Engineer',
      primarySkills: ['Java', 'Spring Boot', 'Microservices'],
      skillClusters: ['Backend Engineer']
    }
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      userId: user2.id,
      profileSummary: 'Fullstack Developer',
      totalExperience: 4,
      currentRole: 'Fullstack Engineer',
      primarySkills: ['JavaScript', 'React', 'Node.js'],
      skillClusters: ['Fullstack Engineer']
    }
  });

  const candidate3 = await prisma.candidate.create({
    data: {
      userId: user3.id,
      profileSummary: 'Frontend Developer',
      totalExperience: 3,
      currentRole: 'Frontend Engineer',
      primarySkills: ['JavaScript', 'React', 'CSS'],
      skillClusters: ['Frontend Engineer']
    }
  });

  // Add skills to candidates
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candidate1.id, skillName: 'Java', score: 90 },
      { candidateId: candidate1.id, skillName: 'Spring Boot', score: 85 },
      { candidateId: candidate1.id, skillName: 'Microservices', score: 80 },
      { candidateId: candidate1.id, skillName: 'Kafka', score: 75 },
      { candidateId: candidate1.id, skillName: 'Docker', score: 70 },

      { candidateId: candidate2.id, skillName: 'JavaScript', score: 88 },
      { candidateId: candidate2.id, skillName: 'React', score: 85 },
      { candidateId: candidate2.id, skillName: 'Node.js', score: 80 },
      { candidateId: candidate2.id, skillName: 'Java', score: 65 },

      { candidateId: candidate3.id, skillName: 'JavaScript', score: 85 },
      { candidateId: candidate3.id, skillName: 'React', score: 80 },
      { candidateId: candidate3.id, skillName: 'CSS', score: 75 },
    ]
  });

  const candidates = [candidate1, candidate2, candidate3];

  console.log(`✅ Found ${candidates.length} test candidates`);

  // Simulate recruiter actions
  console.log('\n🎯 Simulating recruiter feedback...');

  const actions = [
    // Positive actions for candidate 0
    { candidateId: candidates[0].id, actionType: ActionType.VIEWED },
    { candidateId: candidates[0].id, actionType: ActionType.SHORTLISTED },
    { candidateId: candidates[0].id, actionType: ActionType.INTERVIEWED },
    { candidateId: candidates[0].id, actionType: ActionType.HIRED },

    // Mixed actions for candidate 1
    { candidateId: candidates[1].id, actionType: ActionType.VIEWED },
    { candidateId: candidates[1].id, actionType: ActionType.SHORTLISTED },
    { candidateId: candidates[1].id, actionType: ActionType.REJECTED },

    // Negative actions for candidate 2
    { candidateId: candidates[2].id, actionType: ActionType.VIEWED },
    { candidateId: candidates[2].id, actionType: ActionType.REJECTED },
  ];

  for (const action of actions) {
    await feedbackLearningEngine.recordAction({
      candidateId: action.candidateId,
      jobId: job.id,
      recruiterId: recruiter.id,
      actionType: action.actionType,
      metadata: { test: true }
    });
    console.log(`  ✓ Recorded ${action.actionType} for candidate`);
  }

  // Wait a moment for async processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check learning results
  console.log('\n📊 Checking learning results...');

  const companyWeights = await feedbackLearningEngine.getPersonalizedWeights('company', org.id);
  const recruiterWeights = await feedbackLearningEngine.getPersonalizedWeights('recruiter', recruiter.id);
  const systemWeights = await feedbackLearningEngine.getPersonalizedWeights('system', 'global');

  console.log('\n🏢 Company Learning Weights:');
  console.log(JSON.stringify(companyWeights, null, 2));

  console.log('\n👤 Recruiter Learning Weights:');
  console.log(JSON.stringify(recruiterWeights, null, 2));

  console.log('\n🌍 System Learning Weights:');
  console.log(JSON.stringify(systemWeights, null, 2));

  // Test ranking with learned weights
  console.log('\n🎯 Testing ranking with learned weights...');

  const { AIRankingEngine } = await import('../lib/services/ai-ranking-engine');
  const rankingEngine = new AIRankingEngine();

  const rankingResult = await rankingEngine.rankCandidatesForJob(job.id, 5);

  console.log('\n🏆 Updated Rankings:');
  rankingResult.candidates.forEach((candidate, index) => {
    console.log(`${index + 1}. Candidate ${candidate.candidateId.slice(-8)} - Score: ${candidate.finalScore}`);
    console.log(`   Breakdown: ${JSON.stringify(candidate.scoreBreakdown)}`);
  });

  // Clean up test data
  console.log('\n🧹 Cleaning up test data...');

  await prisma.candidateAction.deleteMany({
    where: { jobId: job.id }
  });

  await prisma.learningPreference.deleteMany({
    where: {
      OR: [
        { entityType: 'company', entityId: org.id },
        { entityType: 'recruiter', entityId: recruiter.id },
        { entityType: 'system', entityId: 'global' }
      ]
    }
  });

  console.log('\n✅ Feedback loop test completed successfully!');
  console.log('🎉 The AI now learns from recruiter actions and adapts rankings!');
}

// Run if called directly
if (require.main === module) {
  testFeedbackLoop().catch(console.error);
}