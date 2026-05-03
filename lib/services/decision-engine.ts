import type { Job, Candidate, AssessmentAttempt, InterviewInsight } from '@/lib/types/prisma';
import { getPrisma } from '../prisma';
import { getSkillOntologyService } from './skill-ontology';
import { feedbackLearningEngine } from './feedback-learning-engine';
import { learningLoopService } from './learning-loop';

export interface CandidateSignals {
  skills: number;        // 0–100 (graph match)
  assessment: number;    // 0–100
  interview: number;     // 0–100
  codeQuality: number;   // 0–100
  experience: number;    // 0–100
  behaviorRisk: number;  // 0–1 (higher = worse)
}

export interface SignalData {
  // Profile signals
  skillsMatch: number; // 0-100
  experienceRelevance: number; // 0-100
  techStackAlignment: number; // 0-100

  // Assessment signals
  codingScore: number; // 0-100
  difficultyReached: number; // 0-100
  skillValidation: number; // 0-100

  // Code intelligence signals
  codeQuality: number; // 0-100
  edgeCaseHandling: number; // 0-100
  engineeringThinking: number; // 0-100

  // Interview signals
  communication: number; // 0-100
  depth: number; // 0-100
  problemSolving: number; // 0-100

  // Behavior signals
  suspicionScore: number; // 0-100 (lower is better)
  attentionConsistency: number; // 0-100
}

export interface ConfidenceMultipliers {
  skills: number;        // Resume-based: 0.7
  assessment: number;    // Validated: 1.0
  interview: number;     // Medium-high: 0.85
  codeQuality: number;   // From review: 0.9
  experience: number;    // Resume-based: 0.6
  behaviorRisk: number;  // Behavioral: 0.8
}

export interface RoleWeights {
  backend: {
    skills: number;
    assessment: number;
    interview: number;
    codeQuality: number;
    experience: number;
  };
  frontend: {
    skills: number;
    assessment: number;
    interview: number;
    codeQuality: number;
    experience: number;
  };
  data: {
    skills: number;
    assessment: number;
    interview: number;
    codeQuality: number;
    experience: number;
  };
  fullstack: {
    skills: number;
    assessment: number;
    interview: number;
    codeQuality: number;
    experience: number;
  };
}

export interface HardFilters {
  minAssessmentScore: number;
  minInterviewScore: number;
  minSkillsMatch: number;
  maxBehaviorRisk: number;
  requireAssessment: boolean;
  requireInterview: boolean;
}

export interface FitScoreBreakdown {
  profileSignals: number;
  assessmentSignals: number;
  codeIntelligence: number;
  interviewSignals: number;
  behaviorSignals: number;
  confidenceBoost: number;
}

export interface DecisionResult {
  candidateId: string;
  jobId: string;
  fitScore: number; // 0-100
  recommendation: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: FitScoreBreakdown;
  signals: SignalData;
  explanation: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
    riskFactors: string[];
  };
  metadata: {
    processedAt: Date;
    signalCompleteness: number; // 0-100, percentage of signals available
    confidenceFactors: string[];
  };
}

export interface DecisionEngineConfig {
  weights: {
    profileSignals: number;
    assessmentSignals: number;
    codeIntelligence: number;
    interviewSignals: number;
    behaviorSignals: number;
  };
  thresholds: {
    stronglyRecommended: number;
    recommended: number;
    highConfidence: number;
    mediumConfidence: number;
  };
  confidenceBoosts: {
    skillValidated: number;
    recentExperience: number;
    multipleSignals: number;
  };
  // New sophisticated features
  confidenceMultipliers: ConfidenceMultipliers;
  roleWeights: RoleWeights;
  hardFilters: HardFilters;
}

export class DecisionEngine {
  private prisma = getPrisma();
  private ontologyService = getSkillOntologyService();

  // Default configuration - can be customized per company/role
  private static readonly DEFAULT_CONFIG: DecisionEngineConfig = {
    weights: {
      profileSignals: 0.30,     // Skills, experience, tech stack
      assessmentSignals: 0.25,  // Coding tests, skill validation
      codeIntelligence: 0.15,   // Code quality, engineering thinking
      interviewSignals: 0.15,   // Communication, problem solving
      behaviorSignals: 0.15     // Attention, suspicion (negative weight)
    },
    thresholds: {
      stronglyRecommended: 80,
      recommended: 65,
      highConfidence: 85,
      mediumConfidence: 70
    },
    confidenceBoosts: {
      skillValidated: 1.2,      // 20% boost for validated skills
      recentExperience: 1.1,     // 10% boost for recent experience
      multipleSignals: 1.05      // 5% boost for complete signal set
    },
    // New confidence-weighted scoring
    confidenceMultipliers: {
      skills: 0.7,        // Resume-based skills get lower confidence
      assessment: 1.0,    // Assessment = highest trust
      interview: 0.85,    // Interview = medium-high trust
      codeQuality: 0.9,   // Code review = high trust
      experience: 0.6,    // Experience claims = lower trust
      behaviorRisk: 0.8   // Behavioral signals = good trust
    },
    // Role-specific weight adjustments
    roleWeights: {
      backend: {
        skills: 0.25,
        assessment: 0.35,
        interview: 0.20,
        codeQuality: 0.15,
        experience: 0.05
      },
      frontend: {
        skills: 0.30,
        assessment: 0.25,
        interview: 0.25,
        codeQuality: 0.10,
        experience: 0.10
      },
      data: {
        skills: 0.30,
        assessment: 0.30,
        interview: 0.15,
        codeQuality: 0.10,
        experience: 0.15
      },
      fullstack: {
        skills: 0.25,
        assessment: 0.30,
        interview: 0.20,
        codeQuality: 0.15,
        experience: 0.10
      }
    },
    // Hard filters before ranking
    hardFilters: {
      minAssessmentScore: 50,
      minInterviewScore: 40,
      minSkillsMatch: 30,
      maxBehaviorRisk: 0.7, // 70% risk threshold
      requireAssessment: true,
      requireInterview: false
    }
  };

  /**
   * Normalize all signals to CandidateSignals format (0-100 scale)
   */
  private normalizeSignals(signals: SignalData): CandidateSignals {
    return {
      skills: signals.skillsMatch,
      assessment: signals.codingScore,
      interview: (signals.communication + signals.depth + signals.problemSolving) / 3,
      codeQuality: signals.codeQuality,
      experience: signals.experienceRelevance,
      behaviorRisk: signals.suspicionScore / 100 // Convert to 0-1 scale
    };
  }

  /**
   * Apply confidence-weighted scoring
   */
  private applyConfidenceWeighting(signals: CandidateSignals, multipliers: ConfidenceMultipliers): CandidateSignals {
    return {
      skills: Math.min(100, signals.skills * multipliers.skills),
      assessment: Math.min(100, signals.assessment * multipliers.assessment),
      interview: Math.min(100, signals.interview * multipliers.interview),
      codeQuality: Math.min(100, signals.codeQuality * multipliers.codeQuality),
      experience: Math.min(100, signals.experience * multipliers.experience),
      behaviorRisk: Math.min(1, signals.behaviorRisk * multipliers.behaviorRisk)
    };
  }

  /**
   * Get role-specific weights based on job title/description
   */
  private getRoleWeights(job: any): RoleWeights['backend'] {
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';

    if (title.includes('backend') || title.includes('server') || description.includes('api')) {
      return DecisionEngine.DEFAULT_CONFIG.roleWeights.backend;
    } else if (title.includes('frontend') || title.includes('ui') || description.includes('react')) {
      return DecisionEngine.DEFAULT_CONFIG.roleWeights.frontend;
    } else if (title.includes('data') || title.includes('ml') || description.includes('python')) {
      return DecisionEngine.DEFAULT_CONFIG.roleWeights.data;
    } else if (title.includes('fullstack') || title.includes('full-stack')) {
      return DecisionEngine.DEFAULT_CONFIG.roleWeights.fullstack;
    }

    // Default to backend weights
    return DecisionEngine.DEFAULT_CONFIG.roleWeights.backend;
  }

  /**
   * Apply hard filters - reject candidates who don't meet minimum thresholds
   */
  private passesHardFilters(signals: CandidateSignals, config: DecisionEngineConfig): boolean {
    const filters = config.hardFilters;

    // Required signals check
    if (filters.requireAssessment && signals.assessment === 0) return false;
    if (filters.requireInterview && signals.interview === 0) return false;

    // Minimum score checks
    if (signals.assessment < filters.minAssessmentScore) return false;
    if (signals.interview < filters.minInterviewScore) return false;
    if (signals.skills < filters.minSkillsMatch) return false;

    // Behavior risk check
    if (signals.behaviorRisk > filters.maxBehaviorRisk) return false;

    return true;
  }

  /**
   * Compute final score with confidence weighting and role-specific adjustments
   */
  private computeScore(signals: CandidateSignals, roleWeights: RoleWeights['backend'], behaviorPenalty: number = 0.2): number {
    const score =
      roleWeights.skills * signals.skills +
      roleWeights.assessment * signals.assessment +
      roleWeights.interview * signals.interview +
      roleWeights.codeQuality * signals.codeQuality +
      roleWeights.experience * signals.experience;

    // Apply behavior penalty (soft - affects confidence, not core skill score)
    const penalty = 1 - (signals.behaviorRisk * behaviorPenalty);

    return Math.round(score * penalty);
  }

  /**
   * Generate recommendation based on score
   */
  private getRecommendation(score: number): 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED' {
    if (score >= 80) return 'STRONGLY_RECOMMENDED';
    if (score >= 65) return 'RECOMMENDED';
    return 'NOT_RECOMMENDED';
  }

  /**
   * Enhanced explanation generation with confidence factors
   */
  private generateDetailedExplanation(
    originalSignals: SignalData,
    normalizedSignals: CandidateSignals,
    confidenceMultipliers: ConfidenceMultipliers,
    score: number
  ): DecisionResult['explanation'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const riskFactors: string[] = [];

    // Analyze strengths with confidence context
    if (normalizedSignals.skills > 70) {
      const confidence = confidenceMultipliers.skills;
      strengths.push(`Strong skills match (${confidence === 1.0 ? 'validated' : 'resume-based'})`);
    }
    if (normalizedSignals.assessment > 70) {
      strengths.push('Excellent coding assessment performance (high confidence)');
    }
    if (normalizedSignals.interview > 70) {
      strengths.push('Clear and effective communication in interviews');
    }
    if (normalizedSignals.codeQuality > 70) {
      strengths.push('High-quality code with good engineering practices');
    }
    if (normalizedSignals.experience > 70) {
      strengths.push('Strong relevant experience background');
    }

    // Analyze weaknesses
    if (normalizedSignals.skills < 50) {
      weaknesses.push('Skills gap with job requirements');
    }
    if (normalizedSignals.assessment < 50) {
      weaknesses.push('Below-average coding assessment performance');
    }
    if (normalizedSignals.interview < 50) {
      weaknesses.push('Communication needs improvement');
    }
    if (normalizedSignals.behaviorRisk > 0.6) {
      weaknesses.push('Some behavioral concerns noted');
    }

    // Risk factors with confidence penalties
    if (normalizedSignals.behaviorRisk > 0.7) {
      riskFactors.push('High behavioral risk indicators');
    }
    if (originalSignals.attentionConsistency < 40) {
      riskFactors.push('Low attention consistency during interviews');
    }
    if (confidenceMultipliers.skills < 0.8) {
      riskFactors.push('Skills based primarily on resume claims (not validated)');
    }

    // Generate summary with confidence context
    let summary = '';
    const confidenceLevel = this.calculateConfidenceLevel(normalizedSignals, confidenceMultipliers);

    if (score >= 80 && confidenceLevel === 'HIGH') {
      summary = 'Strong candidate with excellent fit and high-confidence signals.';
    } else if (score >= 80) {
      summary = 'Strong technical fit, but some signals have lower confidence.';
    } else if (score >= 65) {
      summary = 'Good candidate with solid qualifications and minor gaps.';
    } else {
      summary = 'Candidate may need additional development or experience.';
    }

    return { strengths, weaknesses, summary, riskFactors };
  }

  /**
   * Calculate overall confidence level
   */
  private calculateConfidenceLevel(signals: CandidateSignals, multipliers: ConfidenceMultipliers): 'HIGH' | 'MEDIUM' | 'LOW' {
    const weightedConfidence =
      (signals.assessment > 0 ? multipliers.assessment : 0) * 0.3 +
      (signals.interview > 0 ? multipliers.interview : 0) * 0.25 +
      (signals.skills > 0 ? multipliers.skills : 0) * 0.2 +
      (signals.codeQuality > 0 ? multipliers.codeQuality : 0) * 0.15 +
      (signals.experience > 0 ? multipliers.experience : 0) * 0.1;

    if (weightedConfidence > 0.85) return 'HIGH';
    if (weightedConfidence > 0.7) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Main decision function - combines all signals into final recommendation
   */
  async evaluateCandidate(
    candidateId: string,
    jobId: string,
    config?: Partial<DecisionEngineConfig>
  ): Promise<DecisionResult> {
    const finalConfig = { ...DecisionEngine.DEFAULT_CONFIG, ...config };

    // Gather all signal data
    const rawSignals = await this.gatherSignals(candidateId, jobId);

    // Get job for role-specific weighting
    const prisma = await this.prisma;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    // Normalize signals to standard format
    const normalizedSignals = this.normalizeSignals(rawSignals);

    // Apply hard filters first
    if (!this.passesHardFilters(normalizedSignals, finalConfig)) {
      return this.createRejectedResult(candidateId, jobId, normalizedSignals, rawSignals, 'Failed hard filters');
    }

    // Apply confidence-weighted scoring
    const confidenceWeightedSignals = this.applyConfidenceWeighting(
      normalizedSignals,
      finalConfig.confidenceMultipliers
    );

    // Get role-specific weights
    const roleWeights = this.getRoleWeights(job);

    // Calculate final score
    const fitScore = this.computeScore(confidenceWeightedSignals, roleWeights);

    // Generate recommendation
    const recommendation = this.getRecommendation(fitScore);

    // Calculate confidence level
    const confidence = this.calculateConfidenceLevel(confidenceWeightedSignals, finalConfig.confidenceMultipliers);

    // Generate detailed explanation
    const explanation = this.generateDetailedExplanation(
      rawSignals,
      confidenceWeightedSignals,
      finalConfig.confidenceMultipliers,
      fitScore
    );

    // Create breakdown for backward compatibility
    const breakdown = this.calculateComponentScores(rawSignals, finalConfig.weights);

    // Store result for learning
    const result: DecisionResult = {
      candidateId,
      jobId,
      fitScore,
      recommendation,
      confidence,
      breakdown,
      signals: rawSignals,
      explanation,
      metadata: {
        processedAt: new Date(),
        signalCompleteness: this.calculateSignalCompleteness(rawSignals),
        confidenceFactors: this.getConfidenceFactors(rawSignals, this.calculateSignalCompleteness(rawSignals))
      }
    };

    await this.storeDecisionResult(result);

    // Update learning loop with this decision
    await this.updateLearningLoop(result, job);

    return result;
  }

  /**
   * Full pipeline: shortlist candidates with hard filters, confidence weighting, and ranking
   */
  async shortlistCandidates(
    candidateIds: string[],
    jobId: string,
    config?: Partial<DecisionEngineConfig>
  ): Promise<Array<DecisionResult & { rank: number }>> {
    const results: Array<DecisionResult & { rank: number }> = [];

    // Evaluate each candidate
    for (const candidateId of candidateIds) {
      try {
        const result = await this.evaluateCandidate(candidateId, jobId, config);
        results.push({ ...result, rank: 0 }); // rank will be set after sorting
      } catch (error) {
        console.warn(`Failed to evaluate candidate ${candidateId}:`, error);
        // Continue with other candidates
      }
    }

    // Sort by score (highest first) and assign ranks
    results.sort((a, b) => b.fitScore - a.fitScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }

  /**
   * Get ranking for a specific job with all candidates
   */
  async getJobRanking(jobId: string, config?: Partial<DecisionEngineConfig>): Promise<Array<DecisionResult & { rank: number }>> {
    const prisma = await this.prisma;

    // Get all candidates who applied to this job
    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      select: { candidateId: true }
    });

    const candidateIds = applications.map((app: any) => app.candidateId);

    return this.shortlistCandidates(candidateIds, jobId, config);
  }

  /**
   * Create a rejected result for candidates who fail hard filters
   */
  private createRejectedResult(
    candidateId: string,
    jobId: string,
    normalizedSignals: CandidateSignals,
    rawSignals: SignalData,
    reason: string
  ): DecisionResult {
    const breakdown = this.calculateComponentScores(rawSignals, DecisionEngine.DEFAULT_CONFIG.weights);

    return {
      candidateId,
      jobId,
      fitScore: 0,
      recommendation: 'NOT_RECOMMENDED',
      confidence: 'LOW',
      breakdown,
      signals: rawSignals,
      explanation: {
        strengths: [],
        weaknesses: [reason],
        summary: `Candidate rejected: ${reason}`,
        riskFactors: [reason]
      },
      metadata: {
        processedAt: new Date(),
        signalCompleteness: this.calculateSignalCompleteness(rawSignals),
        confidenceFactors: ['Failed hard filters']
      }
    };
  }

  /**
   * Update learning loop with decision outcomes
   */
  private async updateLearningLoop(result: DecisionResult, job: any): Promise<void> {
    try {
      // Record this decision for learning
      await learningLoopService.recordDecision({
        candidateId: result.candidateId,
        jobId: result.jobId,
        score: result.fitScore,
        recommendation: result.recommendation,
        confidence: result.confidence,
        signals: result.signals,
        jobRole: this.inferJobRole(job),
        timestamp: new Date()
      });
    } catch (error) {
      // Log but don't fail the decision process
      console.warn('Failed to update learning loop:', error);
    }
  }

  /**
   * Infer job role from job data
   */
  private inferJobRole(job: any): string {
    const title = job.title?.toLowerCase() || '';
    if (title.includes('backend')) return 'backend';
    if (title.includes('frontend')) return 'frontend';
    if (title.includes('data') || title.includes('ml')) return 'data';
    if (title.includes('fullstack')) return 'fullstack';
    return 'backend'; // default
  }

  /**
   * Gather all available signals for a candidate-job pair
   */
  private async gatherSignals(candidateId: string, jobId: string): Promise<SignalData> {
    const prisma = await this.prisma;

    // Get candidate and job data
    const [candidate, job] = await Promise.all([
      prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { skills: true, inferredSkills: true }
      }),
      prisma.job.findUnique({ where: { id: jobId } })
    ]);

    if (!candidate || !job) {
      throw new Error('Candidate or job not found');
    }

    // Profile signals
    const profileSignals = await this.calculateProfileSignals(candidate, job);

    // Assessment signals
    const assessmentSignals = await this.calculateAssessmentSignals(candidateId, jobId);

    // Code intelligence signals (placeholder - would integrate with code review)
    const codeIntelligence = await this.calculateCodeIntelligenceSignals(candidateId, jobId);

    // Interview signals
    const interviewSignals = await this.calculateInterviewSignals(candidateId, jobId);

    // Behavior signals
    const behaviorSignals = await this.calculateBehaviorSignals(candidateId);

    return {
      ...profileSignals,
      ...assessmentSignals,
      ...codeIntelligence,
      ...interviewSignals,
      ...behaviorSignals
    };
  }

  /**
   * Calculate profile-based signals (skills, experience, tech stack)
   */
  private async calculateProfileSignals(
    candidate: any,
    job: any
  ): Promise<Pick<SignalData, 'skillsMatch' | 'experienceRelevance' | 'techStackAlignment'>> {
    const jobSkills = this.parseJsonArray(job.requiredSkills);
    const candidateSkills = new Set([
      ...candidate.skills.map((s: any) => s.skillName),
      ...candidate.inferredSkills.map((s: any) => s.skillName)
    ]);

    // Skills match using ontology
    let skillsMatch = 0;
    for (const jobSkill of jobSkills) {
      if (candidateSkills.has(jobSkill)) {
        skillsMatch += 100 / jobSkills.length;
      } else {
        // Check for related skills
        const relatedSkills = this.ontologyService.getChildSkills(jobSkill);
        if (relatedSkills.some(skill => candidateSkills.has(skill))) {
          skillsMatch += (100 / jobSkills.length) * 0.7; // Partial credit
        }
      }
    }

    // Experience relevance (simplified)
    const experienceRelevance = Math.min(100,
      (candidate.totalExperience || 0) / (job.experienceRequired || 1) * 50 +
      (candidate.relevantExperience || 0) / (job.experienceRequired || 1) * 50
    );

    // Tech stack alignment (placeholder)
    const techStackAlignment = skillsMatch * 0.8; // Simplified

    return {
      skillsMatch,
      experienceRelevance,
      techStackAlignment
    };
  }

  /**
   * Calculate assessment-based signals
   */
  private async calculateAssessmentSignals(
    candidateId: string,
    jobId: string
  ): Promise<Pick<SignalData, 'codingScore' | 'difficultyReached' | 'skillValidation'>> {
    const prisma = await this.prisma;

    const assessments = await prisma.assessmentAttempt.findMany({
      where: {
        candidateId,
        assessment: {
          jobId: jobId
        }
      },
      include: { assessment: true }
    });

    if (assessments.length === 0) {
      return { codingScore: 0, difficultyReached: 0, skillValidation: 0 };
    }

    // Average coding score
    const codingScore = assessments.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / assessments.length;

    // Difficulty reached (simplified - based on assessment level)
    const difficultyReached = Math.min(100,
      assessments.reduce((max: number, a: any) => Math.max(max, a.assessment.difficulty || 1), 0) * 25
    );

    // Skill validation (how many skills were tested and passed)
    const skillValidation = codingScore * 0.9; // Simplified

    return { codingScore, difficultyReached, skillValidation };
  }

  /**
   * Calculate code intelligence signals (from code reviews/interviews)
   */
  private async calculateCodeIntelligenceSignals(
    candidateId: string,
    jobId: string
  ): Promise<Pick<SignalData, 'codeQuality' | 'edgeCaseHandling' | 'engineeringThinking'>> {
    // Placeholder - would integrate with code review system
    // For now, return neutral scores
    return {
      codeQuality: 50,
      edgeCaseHandling: 50,
      engineeringThinking: 50
    };
  }

  /**
   * Calculate interview signals from AI interviews
   */
  private async calculateInterviewSignals(
    candidateId: string,
    jobId: string
  ): Promise<Pick<SignalData, 'communication' | 'depth' | 'problemSolving'>> {
    const prisma = await this.prisma;

    const interviewInsights = await prisma.interviewInsight.findMany({
      where: {
        interviewSession: {
          candidateId,
          jobId
        }
      }
    });

    if (interviewInsights.length === 0) {
      return { communication: 0, depth: 0, problemSolving: 0 };
    }

    // Average scores from all interviews
    const communication = interviewInsights.reduce((sum: number, i: any) => sum + (i.communicationScore || 0), 0) / interviewInsights.length;
    const depth = interviewInsights.reduce((sum: number, i: any) => sum + (i.technicalScore || 0), 0) / interviewInsights.length;
    const problemSolving = (communication + depth) / 2; // Simplified

    return { communication, depth, problemSolving };
  }

  /**
   * Calculate behavior signals from video interviews
   */
  private async calculateBehaviorSignals(
    candidateId: string
  ): Promise<Pick<SignalData, 'suspicionScore' | 'attentionConsistency'>> {
    const prisma = await this.prisma;

    const interviewInsights = await prisma.interviewInsight.findMany({
      where: {
        interviewSession: {
          candidateId
        }
      }
    });

    if (interviewInsights.length === 0) {
      return { suspicionScore: 50, attentionConsistency: 50 }; // Neutral
    }

    // Calculate suspicion score (lower is better)
    const suspicionScore = interviewInsights.reduce((sum: number, i: any) => sum + (i.riskScore || 50), 0) / interviewInsights.length;

    // Attention consistency from behavioral data
    const attentionConsistency = interviewInsights.reduce((sum: number, i: any) => sum + (i.engagementScore || 50), 0) / interviewInsights.length;

    return { suspicionScore, attentionConsistency };
  }

  /**
   * Apply confidence boosts based on signal quality and validation
   */
  private applyConfidenceBoosts(signals: SignalData, completeness: number): SignalData {
    const boosted = { ...signals };

    // Boost for complete signal set
    if (completeness > 80) {
      Object.keys(boosted).forEach(key => {
        if (typeof boosted[key as keyof SignalData] === 'number' && key !== 'suspicionScore') {
          (boosted as any)[key] = Math.min(100, (boosted as any)[key] * DecisionEngine.DEFAULT_CONFIG.confidenceBoosts.multipleSignals);
        }
      });
    }

    return boosted;
  }

  /**
   * Calculate component scores from individual signals
   */
  private calculateComponentScores(signals: SignalData, weights: DecisionEngineConfig['weights']): FitScoreBreakdown {
    return {
      profileSignals: (signals.skillsMatch * 0.4 + signals.experienceRelevance * 0.3 + signals.techStackAlignment * 0.3),
      assessmentSignals: (signals.codingScore * 0.5 + signals.difficultyReached * 0.3 + signals.skillValidation * 0.2),
      codeIntelligence: (signals.codeQuality * 0.4 + signals.edgeCaseHandling * 0.3 + signals.engineeringThinking * 0.3),
      interviewSignals: (signals.communication * 0.4 + signals.depth * 0.4 + signals.problemSolving * 0.2),
      behaviorSignals: (signals.attentionConsistency * 0.7 + (100 - signals.suspicionScore) * 0.3), // Invert suspicion
      confidenceBoost: 0 // Calculated separately
    };
  }

  /**
   * Calculate final fit score using weighted components
   */
  private calculateFinalScore(breakdown: FitScoreBreakdown, weights: DecisionEngineConfig['weights']): number {
    return Math.round(
      breakdown.profileSignals * weights.profileSignals +
      breakdown.assessmentSignals * weights.assessmentSignals +
      breakdown.codeIntelligence * weights.codeIntelligence +
      breakdown.interviewSignals * weights.interviewSignals +
      breakdown.behaviorSignals * weights.behaviorSignals
    );
  }

  /**
   * Generate recommendation based on score
   */
  private generateRecommendation(
    score: number,
    thresholds: DecisionEngineConfig['thresholds']
  ): 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED' {
    if (score >= thresholds.stronglyRecommended) return 'STRONGLY_RECOMMENDED';
    if (score >= thresholds.recommended) return 'RECOMMENDED';
    return 'NOT_RECOMMENDED';
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(
    score: number,
    signalCompleteness: number,
    thresholds: DecisionEngineConfig['thresholds']
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const combinedScore = (score + signalCompleteness) / 2;

    if (combinedScore >= thresholds.highConfidence) return 'HIGH';
    if (combinedScore >= thresholds.mediumConfidence) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate human-readable explanation
   */
  private async generateExplanation(
    signals: SignalData,
    breakdown: FitScoreBreakdown,
    fitScore: number
  ): Promise<DecisionResult['explanation']> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const riskFactors: string[] = [];

    // Analyze strengths
    if (signals.skillsMatch > 70) strengths.push('Strong skills match with job requirements');
    if (signals.codingScore > 70) strengths.push('Excellent coding assessment performance');
    if (signals.communication > 70) strengths.push('Clear and effective communication in interviews');
    if (signals.codeQuality > 70) strengths.push('High-quality code with good practices');
    if (signals.attentionConsistency > 70) strengths.push('Consistent attention and engagement');

    // Analyze weaknesses
    if (signals.skillsMatch < 50) weaknesses.push('Skills gap with job requirements');
    if (signals.codingScore < 50) weaknesses.push('Below-average coding assessment performance');
    if (signals.communication < 50) weaknesses.push('Communication needs improvement');
    if (signals.suspicionScore > 60) weaknesses.push('Some behavioral concerns noted');

    // Risk factors
    if (signals.suspicionScore > 70) riskFactors.push('High behavioral risk indicators');
    if (signals.attentionConsistency < 40) riskFactors.push('Low attention consistency');

    // Generate summary
    let summary = '';
    if (fitScore >= 80) {
      summary = 'Strong candidate with excellent fit across multiple dimensions.';
    } else if (fitScore >= 65) {
      summary = 'Good candidate with solid qualifications and minor gaps.';
    } else {
      summary = 'Candidate may need additional development or experience.';
    }

    return { strengths, weaknesses, summary, riskFactors };
  }

  /**
   * Calculate signal completeness percentage
   */
  private calculateSignalCompleteness(signals: SignalData): number {
    const signalKeys = Object.keys(signals);
    const availableSignals = signalKeys.filter(key => {
      const value = signals[key as keyof SignalData];
      return typeof value === 'number' && value > 0;
    });

    return (availableSignals.length / signalKeys.length) * 100;
  }

  /**
   * Get factors contributing to confidence
   */
  private getConfidenceFactors(signals: SignalData, completeness: number): string[] {
    const factors: string[] = [];

    if (completeness > 80) factors.push('Complete signal set');
    if (signals.codingScore > 0) factors.push('Assessment validated');
    if (signals.communication > 0) factors.push('Interview completed');
    if (signals.attentionConsistency > 0) factors.push('Behavioral analysis available');

    return factors;
  }

  /**
   * Store decision result for learning and caching
   */
  private async storeDecisionResult(result: DecisionResult): Promise<void> {
    const prisma = await this.prisma;

    await prisma.candidateScore.upsert({
      where: {
        candidateId_jobId: {
          candidateId: result.candidateId,
          jobId: result.jobId
        }
      },
      update: {
        fitScore: result.fitScore,
        recommendation: result.recommendation,
        confidence: result.confidence,
        profileSignals: result.breakdown.profileSignals,
        assessmentSignals: result.breakdown.assessmentSignals,
        codeIntelligence: result.breakdown.codeIntelligence,
        interviewSignals: result.breakdown.interviewSignals,
        behaviorSignals: result.breakdown.behaviorSignals,
        signals: result.signals,
        explanation: result.explanation,
        signalCompleteness: result.metadata.signalCompleteness,
        confidenceFactors: result.metadata.confidenceFactors,
        processedAt: result.metadata.processedAt,
        updatedAt: new Date()
      },
      create: {
        candidateId: result.candidateId,
        jobId: result.jobId,
        fitScore: result.fitScore,
        recommendation: result.recommendation,
        confidence: result.confidence,
        profileSignals: result.breakdown.profileSignals,
        assessmentSignals: result.breakdown.assessmentSignals,
        codeIntelligence: result.breakdown.codeIntelligence,
        interviewSignals: result.breakdown.interviewSignals,
        behaviorSignals: result.breakdown.behaviorSignals,
        signals: result.signals,
        explanation: result.explanation,
        signalCompleteness: result.metadata.signalCompleteness,
        confidenceFactors: result.metadata.confidenceFactors,
        processedAt: result.metadata.processedAt
      }
    });
  }

  /**
   * Utility function to parse JSON arrays safely
   */
  private parseJsonArray(jsonString: string | null): string[] {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const decisionEngine = new DecisionEngine();