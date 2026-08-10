import { prisma } from '../prisma';
import { getSkillInferenceEngine } from './skill-inference-engine';

export type SkillSource = 'assessment' | 'ai_interview';

/**
 * Called after any assessment or AI interview completes.
 * 1. Upserts CandidateSkill rows (isValidated=true for score ≥ 60)
 * 2. Writes SkillAssessment records (per-skill score ledger)
 * 3. Refreshes candidate.primarySkills + skillIntelligence snapshot
 * 4. Runs skill inference to surface adjacent skills
 */
export async function updateCandidateSkillIntelligence(
  candidateId: string,
  skillScores: Record<string, number>, // skill name → 0-100
  source: SkillSource,
  context?: object,
): Promise<void> {
  const now = new Date();

  // 1. Upsert CandidateSkill — validate anything scored ≥ 60
  const upserts = Object.entries(skillScores).map(([skillName, score]) => {
    const validated = score >= 60;
    return prisma.candidateSkill.upsert({
      where: { candidateId_skillName: { candidateId, skillName } },
      create: {
        candidateId,
        skillName,
        category: 'technical',
        score: score / 10,
        source,
        isValidated: validated,
        validatedAt: validated ? now : null,
        validationSource: validated ? source : null,
        lastVerifiedAt: now,
      },
      update: {
        score: score / 10,
        source,
        lastVerifiedAt: now,
        // Only promote to validated — never demote an already-validated skill
        ...(validated
          ? { isValidated: true, validatedAt: now, validationSource: source }
          : {}),
      },
    });
  });

  // 2. Write SkillAssessment records (upsert on unique candidateId+skillName+source)
  const assessments = Object.entries(skillScores).map(([skillName, score]) =>
    prisma.skillAssessment.upsert({
      where: { candidateId_skillName_source: { candidateId, skillName, source } },
      create: {
        candidateId,
        skillName,
        score,
        confidence: score >= 80 ? 0.9 : score >= 60 ? 0.75 : 0.5,
        source,
        context: context ?? {},
      },
      update: {
        score,
        confidence: score >= 80 ? 0.9 : score >= 60 ? 0.75 : 0.5,
        context: context ?? {},
      },
    })
  );

  await Promise.all([...upserts, ...assessments]);

  // 3. Run skill inference for adjacent skills (fire-and-forget — non-blocking)
  const inferenceEngine = getSkillInferenceEngine();
  inferenceEngine.inferSkillsForCandidate(candidateId).catch((err: unknown) =>
    console.error('[skill-updater] inference error:', err)
  );

  // 4. Refresh candidate.primarySkills + skillIntelligence snapshot
  const allSkills = await prisma.candidateSkill.findMany({
    where: { candidateId },
    orderBy: { score: 'desc' },
  });

  const primarySkills = allSkills
    .filter(s => s.score != null && s.score >= 7)
    .slice(0, 10)
    .map(s => s.skillName);

  const validatedSkills = allSkills.filter(s => s.isValidated).map(s => ({
    name: s.skillName,
    score: s.score,
    source: s.source,
    validatedAt: s.validatedAt,
  }));

  const skillIntelligenceSnapshot = {
    updatedAt: now.toISOString(),
    source,
    validatedCount: validatedSkills.length,
    topSkills: allSkills.slice(0, 5).map(s => ({ name: s.skillName, score: s.score })),
    validatedSkills,
  };

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      primarySkills: primarySkills,
      skillIntelligence: skillIntelligenceSnapshot,
    },
  });
}
