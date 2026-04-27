import { Job, Candidate, AssessmentAttempt, InterviewInsight } from '@prisma/client';
import { getPrisma } from '../prisma';
import { getSkillOntologyService } from './skill-ontology';
import { feedbackLearningEngine } from './feedback-learning-engine';

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
    }
  };

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
    const signals = await this.gatherSignals(candidateId, jobId);

    // Calculate signal completeness
    const signalCompleteness = this.calculateSignalCompleteness(signals);

    // Apply confidence boosts
    const boostedSignals = this.applyConfidenceBoosts(signals, signalCompleteness);

    // Calculate component scores
    const breakdown = this.calculateComponentScores(boostedSignals, finalConfig.weights);

    // Calculate final fit score
    const fitScore = this.calculateFinalScore(breakdown, finalConfig.weights);

    // Generate recommendation and confidence
    const recommendation = this.generateRecommendation(fitScore, finalConfig.thresholds);
    const confidence = this.calculateConfidence(fitScore, signalCompleteness, finalConfig.thresholds);

    // Generate explanation
    const explanation = await this.generateExplanation(signals, breakdown, fitScore);

    // Store result for learning
    await this.storeDecisionResult({
      candidateId,
      jobId,
      fitScore,
      recommendation,
      confidence,
      breakdown,
      signals,
      explanation,
      metadata: {
        processedAt: new Date(),
        signalCompleteness,
        confidenceFactors: this.getConfidenceFactors(signals, signalCompleteness)
      }
    });

    return {
      candidateId,
      jobId,
      fitScore,
      recommendation,
      confidence,
      breakdown,
      signals,
      explanation,
      metadata: {
        processedAt: new Date(),
        signalCompleteness,
        confidenceFactors: this.getConfidenceFactors(signals, signalCompleteness)
      }
    };
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