import type { Job, Candidate, CandidateSkill, JobCandidateMatch, InferredSkill } from '@/lib/types/prisma';
import { getPrisma } from '../prisma';
import { getSkillOntologyService } from './skill-ontology';
import { getSkillInferenceEngine } from './skill-inference-engine';
import { feedbackLearningEngine } from './feedback-learning-engine';

export interface JobAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  skillClusters: string[];
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  expandedSkills: string[];
}

export interface CandidateScoring {
  candidateId: string;
  finalScore: number;
  scoreBreakdown: {
    skillMatch: number;      // 0.50 weight
    skillDepth: number;      // 0.15 weight
    inferredSkillBoost: number; // 0.10 weight
    experienceFit: number;   // 0.10 weight
    clusterMatch: number;    // 0.10 weight
    stability: number;       // 0.05 weight
  };
  analysis: {
    strongSkills: string[];
    missingSkills: string[];
    inferredSkills: Array<{
      name: string;
      confidence: number;
      reason: string;
    }>;
    skillGaps: string[];
    roleFit: string;
    riskFlags: string[];
  };
  recommendation: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED';
}

export interface RankingResult {
  jobId: string;
  candidates: CandidateScoring[];
  totalCandidates: number;
  processingTime: number;
}

export class AIRankingEngine {
  private prisma = getPrisma();
  private ontologyService = getSkillOntologyService();
  private inferenceEngine = getSkillInferenceEngine();

  // Scoring weights (must sum to 1.0)
  private static readonly WEIGHTS = {
    skillMatch: 0.50,
    skillDepth: 0.15,
    inferredSkillBoost: 0.10,
    experienceFit: 0.10,
    clusterMatch: 0.10,
    stability: 0.05
  };

  // Confidence thresholds
  private static readonly THRESHOLDS = {
    STRONGLY_RECOMMENDED: 85,
    RECOMMENDED: 70,
    MIN_INFERRED_CONFIDENCE: 0.6
  };

  /**
   * Main ranking function - the core brain of WorkCrew
   */
  async rankCandidatesForJob(jobId: string, limit: number = 100): Promise<RankingResult> {
    const startTime = Date.now();

    // Step 1: Analyze job requirements
    const prisma = await this.prisma;
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Get personalized learning weights
    const companyWeights = await feedbackLearningEngine.getPersonalizedWeights('company', job.organizationId);
    const systemWeights = await feedbackLearningEngine.getPersonalizedWeights('system', 'global');

    const jobAnalysis = await this.analyzeJob(job);

    // Step 2: Fast candidate retrieval (performance critical)
    const candidates = await this.retrieveCandidatePool(jobAnalysis, limit * 2);

    // Step 3: Deep scoring for each candidate
    const scoredCandidates = await Promise.all(
      candidates.map(candidate => this.scoreCandidate(candidate, job, jobAnalysis, companyWeights, systemWeights))
    );

    // Step 4: Sort by final score and limit results
    const rankedCandidates = scoredCandidates
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    // Step 5: Store results for caching
    await this.storeRankingResults(jobId, rankedCandidates);

    const processingTime = Date.now() - startTime;

    return {
      jobId,
      candidates: rankedCandidates,
      totalCandidates: candidates.length,
      processingTime
    };
  }

  /**
   * Step 1: Job Analysis - Extract and expand skills
   */
  private async analyzeJob(job: Job): Promise<JobAnalysis> {
    const requiredSkills = this.parseJsonArray(job.requiredSkills);
    const preferredSkills = this.parseJsonArray(job.preferredSkills);
    const skillClusters = this.parseJsonArray(job.skillClusters);

    // Expand skills using ontology (CHILD + COMPLEMENTARY relationships)
    const expandedSkills = await this.expandJobSkills([...requiredSkills, ...preferredSkills]);

    // Determine seniority level
    const seniority = this.determineSeniority(job.experienceRequired, job.title);

    return {
      requiredSkills,
      preferredSkills,
      skillClusters,
      seniority,
      expandedSkills
    };
  }

  /**
   * Step 2: Fast Candidate Retrieval - Prisma filter first
   */
  private async retrieveCandidatePool(jobAnalysis: JobAnalysis, limit: number): Promise<Array<Candidate & { skills: CandidateSkill[]; inferredSkills: InferredSkill[] }>> {
    // Fast filter using primary skills (most important for performance)
    const primarySkillFilter = jobAnalysis.expandedSkills.slice(0, 5); // Top 5 skills for filtering

    const prisma = await this.prisma;
    const candidates = await prisma.candidate.findMany({
      where: {
        // For now, get all candidates - we'll filter by skills in memory
        // TODO: Optimize with JSON array queries when needed
      },
      include: {
        skills: true,
        inferredSkills: {
          where: {
            confidence: {
              gte: AIRankingEngine.THRESHOLDS.MIN_INFERRED_CONFIDENCE
            }
          }
        }
      },
      take: limit,
      orderBy: {
        totalExperience: 'desc' // Prioritize experienced candidates
      }
    });

    return candidates;
  }

  /**
   * Step 3: Deep Candidate Scoring - Multi-signal intelligence
   */
  private async scoreCandidate(
    candidate: Candidate & { skills: CandidateSkill[]; inferredSkills: InferredSkill[] },
    job: Job,
    jobAnalysis: JobAnalysis,
    companyWeights: any,
    systemWeights: any
  ): Promise<CandidateScoring> {

    // A. Skill Match Score (Ontology-aware)
    const skillMatchScore = this.computeSkillMatchScore(candidate, jobAnalysis);

    // B. Skill Depth Score (Graph relationships)
    const skillDepthScore = this.computeSkillDepthScore(candidate);

    // C. Inferred Skill Boost
    const inferredSkillBoost = this.computeInferredSkillBoost(candidate, jobAnalysis);

    // D. Experience Fit
    const experienceFit = this.computeExperienceFit(candidate, job, jobAnalysis);

    // E. Cluster Match
    const clusterMatch = this.computeClusterMatch(candidate, jobAnalysis);

    // F. Stability Score
    const stability = this.computeStabilityScore(candidate);

    // Get personalized weights (fallback to defaults)
    const weights = {
      skillMatch: companyWeights?.rankingWeights?.skillMatch || systemWeights?.rankingWeights?.skillMatch || AIRankingEngine.WEIGHTS.skillMatch,
      skillDepth: companyWeights?.rankingWeights?.skillDepth || systemWeights?.rankingWeights?.skillDepth || AIRankingEngine.WEIGHTS.skillDepth,
      inferredSkillBoost: companyWeights?.rankingWeights?.inferredSkillBoost || systemWeights?.rankingWeights?.inferredSkillBoost || AIRankingEngine.WEIGHTS.inferredSkillBoost,
      experienceFit: companyWeights?.rankingWeights?.experienceFit || systemWeights?.rankingWeights?.experienceFit || AIRankingEngine.WEIGHTS.experienceFit,
      clusterMatch: companyWeights?.rankingWeights?.clusterMatch || systemWeights?.rankingWeights?.clusterMatch || AIRankingEngine.WEIGHTS.clusterMatch,
      stability: companyWeights?.rankingWeights?.stability || systemWeights?.rankingWeights?.stability || AIRankingEngine.WEIGHTS.stability,
    };

    // Calculate final score with personalized weights
    const finalScore = Math.round(
      skillMatchScore * weights.skillMatch +
      skillDepthScore * weights.skillDepth +
      inferredSkillBoost * weights.inferredSkillBoost +
      experienceFit * weights.experienceFit +
      clusterMatch * weights.clusterMatch +
      stability * weights.stability
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(finalScore);

    // Generate detailed analysis
    const analysis = await this.generateCandidateAnalysis(candidate, jobAnalysis, finalScore);

    return {
      candidateId: candidate.id,
      finalScore,
      scoreBreakdown: {
        skillMatch: skillMatchScore,
        skillDepth: skillDepthScore,
        inferredSkillBoost,
        experienceFit,
        clusterMatch,
        stability
      },
      analysis,
      recommendation
    };
  }

  /**
   * A. Skill Match Score - Ontology-aware matching
   */
  private computeSkillMatchScore(
    candidate: Candidate & { skills: CandidateSkill[]; inferredSkills: InferredSkill[] },
    jobAnalysis: JobAnalysis
  ): number {
    const candidateSkills = new Set([
      ...candidate.skills.map(s => s.skillName),
      ...candidate.inferredSkills.map(s => s.skillName)
    ]);

    let totalScore = 0;
    let totalWeight = 0;

    // Score required skills (higher weight)
    for (const skill of jobAnalysis.requiredSkills) {
      const matchScore = this.getSkillMatchScore(skill, candidateSkills);
      totalScore += matchScore * 1.0; // Required = weight 1.0
      totalWeight += 1.0;
    }

    // Score preferred skills (medium weight)
    for (const skill of jobAnalysis.preferredSkills) {
      const matchScore = this.getSkillMatchScore(skill, candidateSkills);
      totalScore += matchScore * 0.7; // Preferred = weight 0.7
      totalWeight += 0.7;
    }

    // Score expanded skills (lower weight)
    for (const skill of jobAnalysis.expandedSkills) {
      if (!jobAnalysis.requiredSkills.includes(skill) && !jobAnalysis.preferredSkills.includes(skill)) {
        const matchScore = this.getSkillMatchScore(skill, candidateSkills);
        totalScore += matchScore * 0.3; // Expanded = weight 0.3
        totalWeight += 0.3;
      }
    }

    return totalWeight > 0 ? Math.min(totalScore / totalWeight, 1.0) : 0;
  }

  /**
   * Helper: Get match score for a single skill (ontology-aware)
   */
  private getSkillMatchScore(jobSkill: string, candidateSkills: Set<string>): number {
    // Exact match = 1.0
    if (candidateSkills.has(jobSkill)) {
      return 1.0;
    }

    // Child relationship (e.g., job wants "Java", candidate has "Spring Boot") = 0.7
    const childSkills = this.ontologyService.getChildSkills(jobSkill);
    if (childSkills.some(child => candidateSkills.has(child))) {
      return 0.7;
    }

    // Related/Complementary skills = 0.5
    const relatedSkills = this.ontologyService.getRelatedSkills(jobSkill);
    if (relatedSkills.some(related => candidateSkills.has(related))) {
      return 0.5;
    }

    // Parent relationship (less valuable) = 0.3
    const parentSkills = this.ontologyService.getParentSkills(jobSkill);
    if (parentSkills.some(parent => candidateSkills.has(parent))) {
      return 0.3;
    }

    return 0;
  }

  /**
   * B. Skill Depth Score - Average skill strength from graph
   */
  private computeSkillDepthScore(candidate: Candidate & { skills: CandidateSkill[] }): number {
    if (candidate.skills.length === 0) return 0;

    const totalStrength = candidate.skills.reduce((sum, skill) => sum + (skill.score || 0), 0);
    const avgStrength = totalStrength / candidate.skills.length;

    // Normalize to 0-1 scale (assuming max skill score is 100)
    return Math.min(avgStrength / 100, 1.0);
  }

  /**
   * C. Inferred Skill Boost - High-confidence inferences only
   */
  private computeInferredSkillBoost(
    candidate: Candidate & { inferredSkills: InferredSkill[] },
    jobAnalysis: JobAnalysis
  ): number {
    const relevantInferences = candidate.inferredSkills.filter(inferred =>
      jobAnalysis.expandedSkills.includes(inferred.skillName) &&
      inferred.confidence >= AIRankingEngine.THRESHOLDS.MIN_INFERRED_CONFIDENCE
    );

    if (relevantInferences.length === 0) return 0;

    // Average confidence of relevant inferences, capped at 0.5 boost
    const avgConfidence = relevantInferences.reduce((sum, inf) => sum + inf.confidence, 0) / relevantInferences.length;
    return Math.min(avgConfidence * 0.5, 0.5);
  }

  /**
   * D. Experience Fit - Match job requirements
   */
  private computeExperienceFit(
    candidate: Candidate,
    job: Job,
    jobAnalysis: JobAnalysis
  ): number {
    const candidateExp = candidate.totalExperience || 0;
    const jobExpRequired = this.parseExperienceRequired(job.experienceRequired);

    if (!jobExpRequired) return 0.8; // Default if not specified

    // Perfect match = 1.0
    if (Math.abs(candidateExp - jobExpRequired) <= 1) return 1.0;

    // Calculate fit score (inverse of difference, normalized)
    const difference = Math.abs(candidateExp - jobExpRequired);
    const maxDifference = Math.max(jobExpRequired, 10); // Allow up to 10 years difference

    return Math.max(0, 1 - (difference / maxDifference));
  }

  /**
   * E. Cluster Match - Role alignment
   */
  private computeClusterMatch(
    candidate: Candidate,
    jobAnalysis: JobAnalysis
  ): number {
    const candidateClusters = this.parseJsonArray(candidate.skillClusters);
    const jobClusters = jobAnalysis.skillClusters;

    if (candidateClusters.length === 0 || jobClusters.length === 0) return 0.5;

    // Exact cluster match = 1.0
    const exactMatches = candidateClusters.filter(cluster =>
      jobClusters.includes(cluster)
    ).length;

    if (exactMatches > 0) return 1.0;

    // Related clusters (e.g., "Backend Engineer" ↔ "Fullstack Developer") = 0.7
    const relatedMatches = candidateClusters.filter(cluster =>
      this.isRelatedCluster(cluster, jobClusters)
    ).length;

    if (relatedMatches > 0) return 0.7;

    return 0.3; // Some alignment but not direct match
  }

  /**
   * F. Stability Score - Penalize frequent job changes
   */
  private computeStabilityScore(candidate: Candidate): number {
    // This is a simplified version. In production, you'd analyze work history
    // For now, assume stable unless we have risk indicators

    const riskFlags: string[] = [];

    // Check for very short total experience with high number of roles
    // (This would require work experience data analysis)

    // Default to 0.8 (good stability) unless we detect issues
    return 0.8;
  }

  /**
   * Generate detailed analysis for UI
   */
  private async generateCandidateAnalysis(
    candidate: Candidate & { skills: CandidateSkill[]; inferredSkills: InferredSkill[] },
    jobAnalysis: JobAnalysis,
    finalScore: number
  ): Promise<CandidateScoring['analysis']> {

    const candidateSkills = new Set(candidate.skills.map(s => s.skillName));

    // Strong skills (exact matches with high scores)
    const strongSkills = jobAnalysis.requiredSkills.filter(skill =>
      candidateSkills.has(skill) &&
      (candidate.skills.find(s => s.skillName === skill)?.score || 0) >= 80
    );

    // Missing skills
    const missingSkills = jobAnalysis.requiredSkills.filter(skill =>
      !candidateSkills.has(skill) &&
      !candidate.inferredSkills.some(inf => inf.skillName === skill)
    );

    // Inferred skills relevant to job
    const relevantInferred = candidate.inferredSkills
      .filter(inf => jobAnalysis.expandedSkills.includes(inf.skillName))
      .map(inf => ({
        name: inf.skillName,
        confidence: inf.confidence,
        reason: inf.reason ?? ''
      }));

    // Skill gaps (missing important skills)
    const skillGaps = jobAnalysis.requiredSkills.filter(skill =>
      !candidateSkills.has(skill) &&
      !relevantInferred.some(inf => inf.name === skill)
    );

    // Role fit
    const roleFit = this.determineRoleFit(candidate, jobAnalysis);

    // Risk flags
    const riskFlags = this.generateRiskFlags(candidate, finalScore);

    return {
      strongSkills,
      missingSkills,
      inferredSkills: relevantInferred,
      skillGaps,
      roleFit,
      riskFlags
    };
  }

  /**
   * Store ranking results for caching and fast retrieval
   */
  private async storeRankingResults(jobId: string, candidates: CandidateScoring[]): Promise<void> {
    const prisma = await this.prisma;

    // Delete existing matches for this job
    await prisma.jobCandidateMatch.deleteMany({
      where: { jobId }
    });

    // Insert new matches
    const matchData = candidates.map(candidate => ({
      jobId,
      candidateId: candidate.candidateId,
      score: candidate.finalScore,
      recommendation: candidate.recommendation,
      scoreBreakdown: candidate.scoreBreakdown,
      analysis: candidate.analysis
    }));

    await prisma.jobCandidateMatch.createMany({
      data: matchData
    });
  }

  // Helper methods

  private parseJsonArray(json: any): string[] {
    if (Array.isArray(json)) return json;
    if (typeof json === 'string') {
      try {
        return JSON.parse(json);
      } catch {
        return [];
      }
    }
    return [];
  }

  private async expandJobSkills(skills: string[]): Promise<string[]> {
    const expanded = new Set(skills);

    for (const skill of skills) {
      // Add child skills (e.g., Java → Spring Boot)
      const children = this.ontologyService.getChildSkills(skill);
      children.forEach(child => expanded.add(child));

      // Add complementary skills (e.g., Java → Maven, Gradle)
      const related = this.ontologyService.getRelatedSkills(skill);
      related.forEach(rel => expanded.add(rel));
    }

    return Array.from(expanded);
  }

  private determineSeniority(experienceRequired: string | null, title: string): JobAnalysis['seniority'] {
    if (!experienceRequired) {
      // Infer from title
      const titleLower = title.toLowerCase();
      if (titleLower.includes('lead') || titleLower.includes('senior') || titleLower.includes('principal')) return 'SENIOR';
      if (titleLower.includes('junior') || titleLower.includes('entry')) return 'JUNIOR';
      return 'MID';
    }

    const exp = this.parseExperienceRequired(experienceRequired);
    if (exp >= 8) return 'SENIOR';
    if (exp >= 5) return 'MID';
    if (exp >= 2) return 'JUNIOR';
    return 'JUNIOR';
  }

  private parseExperienceRequired(exp: string | null): number {
    if (!exp) return 0;

    const match = exp.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private generateRecommendation(score: number): CandidateScoring['recommendation'] {
    if (score >= AIRankingEngine.THRESHOLDS.STRONGLY_RECOMMENDED) return 'STRONGLY_RECOMMENDED';
    if (score >= AIRankingEngine.THRESHOLDS.RECOMMENDED) return 'RECOMMENDED';
    return 'NOT_RECOMMENDED';
  }

  private isRelatedCluster(candidateCluster: string, jobClusters: string[]): boolean {
    // Simple relatedness logic - in production, this would use a cluster ontology
    const clusterMap: Record<string, string[]> = {
      'Backend Engineer': ['Fullstack Developer', 'Software Engineer'],
      'Frontend Engineer': ['Fullstack Developer', 'UI Developer'],
      'Fullstack Developer': ['Backend Engineer', 'Frontend Engineer'],
      'DevOps Engineer': ['Site Reliability Engineer', 'Platform Engineer'],
      'Data Scientist': ['Machine Learning Engineer', 'Data Engineer'],
      'Machine Learning Engineer': ['Data Scientist', 'AI Engineer']
    };

    return jobClusters.some(jobCluster =>
      clusterMap[candidateCluster]?.includes(jobCluster) ||
      clusterMap[jobCluster]?.includes(candidateCluster)
    );
  }

  private determineRoleFit(candidate: Candidate, jobAnalysis: JobAnalysis): string {
    const candidateClusters = this.parseJsonArray(candidate.skillClusters);

    // Find best matching cluster
    for (const jobCluster of jobAnalysis.skillClusters) {
      if (candidateClusters.includes(jobCluster)) {
        return jobCluster;
      }
    }

    // Find related cluster
    for (const candidateCluster of candidateClusters) {
      if (this.isRelatedCluster(candidateCluster, jobAnalysis.skillClusters)) {
        return `${candidateCluster} → ${jobAnalysis.skillClusters[0]}`;
      }
    }

    return candidateClusters[0] || 'General Developer';
  }

  private generateRiskFlags(candidate: Candidate, score: number): string[] {
    const flags: string[] = [];

    if (score < 50) {
      flags.push('Low overall fit score');
    }

    if (!candidate.totalExperience || candidate.totalExperience < 1) {
      flags.push('Limited professional experience');
    }

    // Add more risk analysis based on candidate data

    return flags;
  }

  /**
   * NEW: Multi-signal decision engine ranking (replaces traditional ranking)
   * Uses comprehensive signal aggregation with explainability
   */
  async rankCandidatesWithDecisionEngine(jobId: string, limit: number = 100): Promise<RankingResult> {
    const startTime = Date.now();

    // Import decision engine dynamically to avoid circular dependencies
    const { decisionEngine } = await import('./decision-engine');

    const prisma = await this.prisma;

    // Get all candidates who have applied or been considered for this job
    let candidateIds: string[] = await prisma.candidateApplication.findMany({
      where: { jobId },
      select: { candidateId: true }
    }).then((applications: { candidateId: string }[]) => applications.map(app => app.candidateId));

    // If no applications, get candidates with relevant skills (fallback)
    if (candidateIds.length === 0) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { requiredSkills: true, preferredSkills: true }
      });

      if (job) {
        const jobSkills = [
          ...this.parseJsonArray(job.requiredSkills),
          ...this.parseJsonArray(job.preferredSkills)
        ].slice(0, 3); // Top 3 skills for broad matching

        const candidatesWithSkills = await prisma.candidateSkill.findMany({
          where: {
            skillName: { in: jobSkills }
          },
          select: { candidateId: true },
          distinct: ['candidateId']
        });

        candidateIds.push(...candidatesWithSkills.map((c: { candidateId: string }) => c.candidateId));
      }
    }

    // Remove duplicates and limit initial pool
    const uniqueCandidateIds = [...new Set(candidateIds)].slice(0, limit * 3);

    // Evaluate each candidate using decision engine
    const decisionResults = await Promise.all(
      uniqueCandidateIds.map(async (candidateId) => {
        try {
          return await decisionEngine.evaluateCandidate(candidateId, jobId);
        } catch (error) {
          console.warn(`Failed to evaluate candidate ${candidateId} for job ${jobId}:`, error);
          return null;
        }
      })
    );

    // Filter out failed evaluations and sort by fit score
    const validResults = decisionResults.filter((result): result is NonNullable<typeof result> => result !== null);
    const rankedResults = validResults
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, limit);

    // Convert decision results to CandidateScoring format for backward compatibility
    const scoredCandidates: CandidateScoring[] = rankedResults.map(result => ({
      candidateId: result.candidateId,
      finalScore: result.fitScore,
      scoreBreakdown: {
        skillMatch: result.breakdown.profileSignals,
        skillDepth: result.breakdown.assessmentSignals,
        inferredSkillBoost: result.breakdown.codeIntelligence,
        experienceFit: result.breakdown.interviewSignals,
        clusterMatch: result.breakdown.behaviorSignals,
        stability: result.metadata.signalCompleteness
      },
      analysis: {
        strongSkills: result.explanation.strengths,
        missingSkills: result.explanation.weaknesses,
        inferredSkills: [], // Would need to populate from signals
        skillGaps: result.explanation.riskFactors,
        roleFit: result.explanation.summary,
        riskFlags: result.explanation.riskFactors
      },
      recommendation: result.recommendation
    }));

    const processingTime = Date.now() - startTime;

    return {
      jobId,
      candidates: scoredCandidates,
      totalCandidates: uniqueCandidateIds.length,
      processingTime
    };
  }
}

// Singleton instance
let aiRankingEngine: AIRankingEngine;

export function getAIRankingEngine(): AIRankingEngine {
  if (!aiRankingEngine) {
    aiRankingEngine = new AIRankingEngine();
  }
  return aiRankingEngine;
}