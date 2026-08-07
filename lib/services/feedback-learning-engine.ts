// lib/services/feedback-learning-engine.ts
import { getPrisma } from '../prisma';
import { ActionType } from '@/lib/types/prisma';
import type { CandidateAction, Prisma } from '@/lib/types/prisma';

type CandidateActionWithCandidate = any;

/**
 * Action weights for the feedback learning system
 * Higher weights = stronger signals for learning
 */
export const ACTION_WEIGHTS = {
  [ActionType.VIEWED]: 1,
  [ActionType.IGNORED]: -2,
  [ActionType.REJECTED]: -5,
  [ActionType.SHORTLISTED]: 5,
  [ActionType.INTERVIEWED]: 8,
  [ActionType.HIRED]: 15,
} as const;

/**
 * Learning Engine for AI Ranking Feedback Loop
 *
 * Processes recruiter actions to continuously improve:
 * - Skill weights
 * - Ranking model parameters
 * - Inference confidence
 * - Company-specific preferences
 */
export class FeedbackLearningEngine {
  private static readonly LEARNING_RATE = 0.1; // How aggressively to update weights
  private static readonly MIN_SUCCESS_RATE = 0.3; // Minimum success rate to consider
  private static readonly MAX_HISTORY_DAYS = 90; // Look back period for learning

  /**
   * Record a recruiter action for learning
   */
  async recordAction(params: {
    candidateId: string;
    jobId: string;
    recruiterId: string;
    actionType: ActionType;
    metadata?: Record<string, any>;
  }) {
    const prisma = await getPrisma();

    // Get job and company context for caching
    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      select: {
        title: true,
        organizationId: true,
      },
    });

    if (!job) {
      throw new Error(`Job ${params.jobId} not found`);
    }

    // Record the action
    await prisma.candidateAction.create({
      data: {
        candidateId: params.candidateId,
        jobId: params.jobId,
        recruiterId: params.recruiterId,
        actionType: params.actionType,
        weight: ACTION_WEIGHTS[params.actionType],
        jobTitle: job.title,
        companyId: job.organizationId,
        metadata: params.metadata || {},
      },
    });

    // Trigger immediate learning update (async)
    this.updateLearningModel(params.jobId, job.organizationId, params.recruiterId).catch(console.error);
  }

  /**
   * Update learning models based on new action
   */
  private async updateLearningModel(jobId: string, companyId: string, recruiterId: string) {
    // Update company-specific preferences
    await this.updateCompanyPreferences(companyId);

    // Update recruiter-specific preferences
    await this.updateRecruiterPreferences(recruiterId);

    // Update global skill weights
    await this.updateGlobalSkillWeights();
  }

  /**
   * Update company-specific learning preferences
   */
  private async updateCompanyPreferences(companyId: string) {
    const prisma = await getPrisma();

    // Get recent actions for this company
    const recentActions = await prisma.candidateAction.findMany({
      where: {
        companyId,
        createdAt: {
          gte: new Date(Date.now() - this.daysToMs(FeedbackLearningEngine.MAX_HISTORY_DAYS)),
        },
      },
      include: {
        candidate: {
          include: {
            skills: true,
            inferredSkills: true,
          },
        },
      },
    });

    if (recentActions.length < 10) return; // Need minimum data

    // Calculate skill success rates
    const skillStats = this.calculateSkillSuccessRates(recentActions);

    // Update or create learning preferences
    await prisma.learningPreference.upsert({
      where: {
        entityType_entityId: {
          entityType: 'company',
          entityId: companyId,
        },
      },
      update: {
        skillWeights: skillStats.weights,
        totalActions: { increment: recentActions.length },
        successfulHires: {
          increment: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
        },
        updatedAt: new Date(),
      },
      create: {
        entityType: 'company',
        entityId: companyId,
        skillWeights: skillStats.weights,
        rankingWeights: {}, // Will be updated separately
        totalActions: recentActions.length,
        successfulHires: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
      },
    });
  }

  /**
   * Update recruiter-specific learning preferences
   */
  private async updateRecruiterPreferences(recruiterId: string) {
    const prisma = await getPrisma();

    // Get recent actions by this recruiter
    const recentActions = await prisma.candidateAction.findMany({
      where: {
        recruiterId,
        createdAt: {
          gte: new Date(Date.now() - this.daysToMs(FeedbackLearningEngine.MAX_HISTORY_DAYS)),
        },
      },
      include: {
        candidate: {
          include: {
            skills: true,
            inferredSkills: true,
          },
        },
      },
    });

    if (recentActions.length < 5) return; // Need minimum data

    const skillStats = this.calculateSkillSuccessRates(recentActions);

    await prisma.learningPreference.upsert({
      where: {
        entityType_entityId: {
          entityType: 'recruiter',
          entityId: recruiterId,
        },
      },
      update: {
        skillWeights: skillStats.weights,
        totalActions: { increment: recentActions.length },
        successfulHires: {
          increment: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
        },
        updatedAt: new Date(),
      },
      create: {
        entityType: 'recruiter',
        entityId: recruiterId,
        skillWeights: skillStats.weights,
        rankingWeights: {},
        totalActions: recentActions.length,
        successfulHires: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
      },
    });
  }

  /**
   * Update global skill weights based on system-wide patterns
   */
  private async updateGlobalSkillWeights() {
    const prisma = await getPrisma();

    // Get all recent actions system-wide
    const recentActions = await prisma.candidateAction.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - this.daysToMs(FeedbackLearningEngine.MAX_HISTORY_DAYS)),
        },
      },
      include: {
        candidate: {
          include: {
            skills: true,
          },
        },
      },
      take: 1000, // Limit for performance
    });

    if (recentActions.length < 50) return;

    const skillStats = this.calculateSkillSuccessRates(recentActions);

    // Store global skill weights (could be in a separate table or config)
    // For now, we'll update a system-wide preference record
    await prisma.learningPreference.upsert({
      where: {
        entityType_entityId: {
          entityType: 'system',
          entityId: 'global',
        },
      },
      update: {
        skillWeights: skillStats.weights,
        totalActions: { increment: recentActions.length },
        successfulHires: {
          increment: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
        },
        updatedAt: new Date(),
      },
      create: {
        entityType: 'system',
        entityId: 'global',
        skillWeights: skillStats.weights,
        rankingWeights: {},
        totalActions: recentActions.length,
        successfulHires: recentActions.filter((a: CandidateAction) => a.actionType === ActionType.HIRED).length,
      },
    });
  }

  /**
   * Calculate skill success rates from actions
   */
  private calculateSkillSuccessRates(actions: CandidateActionWithCandidate[]): { weights: Record<string, number> } {
    const skillStats: Record<string, { total: number; hired: number }> = {};

    for (const action of actions) {
      const candidate = action.candidate;
      if (!candidate?.skills) continue;

      const isPositive = ['SHORTLISTED', 'INTERVIEWED', 'HIRED'].includes(action.actionType);
      const weight = Math.abs(action.weight);

      for (const skill of candidate.skills) {
        if (!skillStats[skill.skillName]) {
          skillStats[skill.skillName] = { total: 0, hired: 0 };
        }

        skillStats[skill.skillName].total += weight;

        if (action.actionType === ActionType.HIRED) {
          skillStats[skill.skillName].hired += weight;
        }
      }
    }

    // Calculate success rates and convert to weights
    const weights: Record<string, number> = {};
    for (const [skill, stats] of Object.entries(skillStats)) {
      if (stats.total >= 5) { // Minimum sample size
        const successRate = stats.hired / stats.total;
        if (successRate >= FeedbackLearningEngine.MIN_SUCCESS_RATE) {
          // Convert success rate to weight adjustment (0.8-1.2 range)
          weights[skill] = 0.8 + (successRate * 0.4);
        }
      }
    }

    return { weights };
  }

  /**
   * Get personalized weights for ranking
   */
  async getPersonalizedWeights(entityType: 'company' | 'recruiter' | 'system', entityId: string) {
    const prisma = await getPrisma();

    const preference = await prisma.learningPreference.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    });

    return {
      skillWeights: preference?.skillWeights || {},
      rankingWeights: preference?.rankingWeights || {},
      inferenceMultipliers: preference?.inferenceMultipliers || {},
    };
  }

  /**
   * Batch process feedback (run daily)
   */
  async processBatchFeedback() {
    console.log('🧠 Processing batch feedback learning...');

    const prisma = await getPrisma();

    // Get all companies with recent activity
    const activeCompanies = await prisma.organization.findMany({
      where: {
        users: {
          some: {
            actions: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - this.daysToMs(1)), // Last 24 hours
                },
              },
            },
          },
        },
      },
      select: { id: true },
    });

    // Update each company's learning model
    for (const company of activeCompanies) {
      await this.updateCompanyPreferences(company.id);
    }

    // Update global model
    await this.updateGlobalSkillWeights();

    console.log(`✅ Processed feedback for ${activeCompanies.length} companies`);
  }

  private daysToMs(days: number): number {
    return days * 24 * 60 * 60 * 1000;
  }
}

// Singleton instance
export const feedbackLearningEngine = new FeedbackLearningEngine();

export interface RecruiterFeedback {
  candidateId: string;
  jobId: string;
  action: 'accepted' | 'rejected' | 'shortlisted' | 'interviewed';
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  signalAdjustments?: {
    profileSignals?: number;
    assessmentSignals?: number;
    codeIntelligence?: number;
    interviewSignals?: number;
    behaviorSignals?: number;
  };
  timestamp: Date;
}

export interface LearningMetrics {
  totalFeedback: number;
  accuracy: number;
  signalWeights: {
    profileSignals: number;
    assessmentSignals: number;
    codeIntelligence: number;
    interviewSignals: number;
    behaviorSignals: number;
  };
  lastUpdated: Date;
}

export class LearningLoopService {
  private prisma = getPrisma();

  async recordFeedback(feedback: RecruiterFeedback): Promise<void> {
    const prisma = await this.prisma;

    await prisma.candidateScore.updateMany({
      where: { candidateId: feedback.candidateId, jobId: feedback.jobId },
      data: {
        recruiterFeedback: {
          action: feedback.action,
          confidence: feedback.confidence,
          notes: feedback.notes,
          signalAdjustments: feedback.signalAdjustments,
          timestamp: feedback.timestamp
        },
        feedbackApplied: false
      }
    });

    this.processFeedbackForLearning(feedback).catch(error => {
      console.error('Failed to process feedback for learning:', error);
    });
  }

  private async processFeedbackForLearning(feedback: RecruiterFeedback): Promise<void> {
    const prisma = await this.prisma;

    const originalScore = await prisma.candidateScore.findFirst({
      where: { candidateId: feedback.candidateId, jobId: feedback.jobId }
    });

    if (!originalScore) {
      console.warn(`No original score found for candidate ${feedback.candidateId} and job ${feedback.jobId}`);
      return;
    }

    const wasCorrect = this.evaluateRecommendationAccuracy(
      originalScore.recommendation,
      feedback.action,
      originalScore.confidence
    );

    await this.updateWeightsFromFeedback(feedback, originalScore, wasCorrect);

    await prisma.candidateScore.updateMany({
      where: { candidateId: feedback.candidateId, jobId: feedback.jobId },
      data: { feedbackApplied: true }
    });
  }

  private evaluateRecommendationAccuracy(
    recommendation: string,
    actualAction: string,
    confidence: string
  ): boolean {
    const positiveActions = ['accepted', 'shortlisted', 'interviewed'];
    const isPositiveRecommendation = recommendation === 'STRONGLY_RECOMMENDED' || recommendation === 'RECOMMENDED';
    const isPositiveAction = positiveActions.includes(actualAction);

    if (isPositiveRecommendation === isPositiveAction) return true;

    if (confidence !== 'HIGH' && (
      (recommendation === 'RECOMMENDED' && actualAction === 'rejected') ||
      (recommendation === 'NOT_RECOMMENDED' && actualAction === 'shortlisted')
    )) return true;

    return false;
  }

  private async updateWeightsFromFeedback(
    feedback: RecruiterFeedback,
    originalScore: any,
    wasCorrect: boolean
  ): Promise<void> {
    const prisma = await this.prisma;
    const job = await prisma.job.findUnique({
      where: { id: feedback.jobId },
      select: { organizationId: true }
    });

    if (!job) return;

    const adjustments = this.calculateWeightAdjustments(feedback, originalScore, wasCorrect);
    const actionType = this.mapFeedbackActionToActionType(feedback.action);

    await feedbackLearningEngine.recordAction({
      candidateId: feedback.candidateId,
      jobId: feedback.jobId,
      recruiterId: 'system',
      actionType,
      metadata: { wasCorrect, adjustments, confidence: feedback.confidence, originalScore }
    });
  }

  private calculateWeightAdjustments(
    feedback: RecruiterFeedback,
    originalScore: any,
    wasCorrect: boolean
  ): Record<string, number> {
    const adjustments: Record<string, number> = {};

    if (!wasCorrect) {
      const signalBreakdown = {
        profileSignals: originalScore.profileSignals,
        assessmentSignals: originalScore.assessmentSignals,
        codeIntelligence: originalScore.codeIntelligence,
        interviewSignals: originalScore.interviewSignals,
        behaviorSignals: originalScore.behaviorSignals
      };

      const sortedSignals = Object.entries(signalBreakdown).sort(([, a], [, b]) => (b as number) - (a as number));
      adjustments[sortedSignals[0][0]] = -0.05;
      sortedSignals.slice(-2).forEach(([signalName]) => {
        adjustments[signalName] = (adjustments[signalName] || 0) + 0.03;
      });
    }

    if (feedback.signalAdjustments) {
      Object.entries(feedback.signalAdjustments).forEach(([signal, adjustment]) => {
        adjustments[signal] = (adjustments[signal] || 0) + (adjustment as number) * 0.1;
      });
    }

    return adjustments;
  }

  async getLearningMetrics(organizationId: string): Promise<LearningMetrics> {
    const prisma = await this.prisma;

    const feedbackData = await prisma.candidateScore.findMany({
      where: { job: { organizationId }, recruiterFeedback: { not: null } },
      select: { recruiterFeedback: true, recommendation: true, confidence: true }
    });

    const totalFeedback = feedbackData.length;
    let correctPredictions = 0;

    feedbackData.forEach((score: any) => {
      if (score.recruiterFeedback) {
        const wasCorrect = this.evaluateRecommendationAccuracy(
          score.recommendation, score.recruiterFeedback.action, score.confidence
        );
        if (wasCorrect) correctPredictions++;
      }
    });

    const accuracy = totalFeedback > 0 ? (correctPredictions / totalFeedback) * 100 : 0;
    const currentWeights = await feedbackLearningEngine.getPersonalizedWeights('company', organizationId);

    return {
      totalFeedback,
      accuracy,
      signalWeights: {
        profileSignals: currentWeights.rankingWeights?.profileSignals || 0.30,
        assessmentSignals: currentWeights.rankingWeights?.assessmentSignals || 0.25,
        codeIntelligence: currentWeights.rankingWeights?.codeIntelligence || 0.15,
        interviewSignals: currentWeights.rankingWeights?.interviewSignals || 0.15,
        behaviorSignals: currentWeights.rankingWeights?.behaviorSignals || 0.15
      },
      lastUpdated: new Date()
    };
  }

  async getJobFeedbackSummary(jobId: string): Promise<{
    totalCandidates: number;
    acceptedCount: number;
    rejectedCount: number;
    accuracy: number;
    commonAdjustments: Record<string, number>;
  }> {
    const prisma = await this.prisma;

    const scores = await prisma.candidateScore.findMany({
      where: { jobId },
      select: { recruiterFeedback: true, recommendation: true, confidence: true }
    });

    let acceptedCount = 0, rejectedCount = 0, correctCount = 0;
    const adjustments: Record<string, number[]> = {};

    scores.forEach((score: any) => {
      if (score.recruiterFeedback) {
        const action = score.recruiterFeedback.action;
        if (action === 'accepted' || action === 'shortlisted') acceptedCount++;
        if (action === 'rejected') rejectedCount++;

        if (this.evaluateRecommendationAccuracy(score.recommendation, action, score.confidence)) correctCount++;

        if (score.recruiterFeedback.signalAdjustments) {
          Object.entries(score.recruiterFeedback.signalAdjustments).forEach(([signal, adj]) => {
            if (!adjustments[signal]) adjustments[signal] = [];
            adjustments[signal].push(adj as number);
          });
        }
      }
    });

    const commonAdjustments: Record<string, number> = {};
    Object.entries(adjustments).forEach(([signal, values]) => {
      commonAdjustments[signal] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return {
      totalCandidates: scores.length,
      acceptedCount,
      rejectedCount,
      accuracy: scores.length > 0 ? (correctCount / scores.length) * 100 : 0,
      commonAdjustments
    };
  }

  async recordDecision(decision: {
    candidateId: string;
    jobId: string;
    score: number;
    recommendation: string;
    confidence: string;
    signals: any;
    jobRole: string;
    timestamp: Date;
  }): Promise<void> {
    const prisma = await this.prisma;

    await prisma.candidateScore.updateMany({
      where: { candidateId: decision.candidateId, jobId: decision.jobId },
      data: {
        decisionMetadata: {
          score: decision.score,
          recommendation: decision.recommendation,
          confidence: decision.confidence,
          signals: decision.signals,
          jobRole: decision.jobRole,
          timestamp: decision.timestamp
        }
      }
    });
  }

  private mapFeedbackActionToActionType(action: string): ActionType {
    switch (action) {
      case 'accepted': return ActionType.HIRED;
      case 'shortlisted': return ActionType.SHORTLISTED;
      case 'interviewed': return ActionType.INTERVIEWED;
      case 'rejected': return ActionType.REJECTED;
      default: return ActionType.VIEWED;
    }
  }
}

export const learningLoopService = new LearningLoopService();