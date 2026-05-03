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