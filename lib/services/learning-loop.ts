import { getPrisma } from '../prisma';
import { feedbackLearningEngine } from './feedback-learning-engine';
import { ActionType } from '@prisma/client';

export interface RecruiterFeedback {
  candidateId: string;
  jobId: string;
  action: 'accepted' | 'rejected' | 'shortlisted' | 'interviewed';
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  signalAdjustments?: {
    profileSignals?: number; // -1 to 1 (negative reduces weight, positive increases)
    assessmentSignals?: number;
    codeIntelligence?: number;
    interviewSignals?: number;
    behaviorSignals?: number;
  };
  timestamp: Date;
}

export interface LearningMetrics {
  totalFeedback: number;
  accuracy: number; // percentage of correct recommendations
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

  /**
   * Record recruiter feedback for learning
   */
  async recordFeedback(feedback: RecruiterFeedback): Promise<void> {
    const prisma = await this.prisma;

    // Store feedback in CandidateScore model
    await prisma.candidateScore.updateMany({
      where: {
        candidateId: feedback.candidateId,
        jobId: feedback.jobId
      },
      data: {
        recruiterFeedback: {
          action: feedback.action,
          confidence: feedback.confidence,
          notes: feedback.notes,
          signalAdjustments: feedback.signalAdjustments,
          timestamp: feedback.timestamp
        },
        feedbackApplied: false // Will be set to true after processing
      }
    });

    // Trigger learning update (async)
    this.processFeedbackForLearning(feedback).catch(error => {
      console.error('Failed to process feedback for learning:', error);
    });
  }

  /**
   * Process feedback to update decision engine weights
   */
  private async processFeedbackForLearning(feedback: RecruiterFeedback): Promise<void> {
    const prisma = await this.prisma;

    // Get the original decision result
    const originalScore = await prisma.candidateScore.findFirst({
      where: {
        candidateId: feedback.candidateId,
        jobId: feedback.jobId
      }
    });

    if (!originalScore) {
      console.warn(`No original score found for candidate ${feedback.candidateId} and job ${feedback.jobId}`);
      return;
    }

    // Calculate if the recommendation was correct
    const wasCorrect = this.evaluateRecommendationAccuracy(
      originalScore.recommendation,
      feedback.action,
      originalScore.confidence
    );

    // Update learning weights based on feedback
    await this.updateWeightsFromFeedback(feedback, originalScore, wasCorrect);

    // Mark feedback as applied
    await prisma.candidateScore.updateMany({
      where: {
        candidateId: feedback.candidateId,
        jobId: feedback.jobId
      },
      data: {
        feedbackApplied: true
      }
    });
  }

  /**
   * Evaluate if the original recommendation was accurate
   */
  private evaluateRecommendationAccuracy(
    recommendation: string,
    actualAction: string,
    confidence: string
  ): boolean {
    const positiveActions = ['accepted', 'shortlisted', 'interviewed'];
    const isPositiveRecommendation = recommendation === 'STRONGLY_RECOMMENDED' || recommendation === 'RECOMMENDED';
    const isPositiveAction = positiveActions.includes(actualAction);

    // Exact match
    if (isPositiveRecommendation === isPositiveAction) {
      return true;
    }

    // Allow some tolerance for medium/low confidence recommendations
    if (confidence !== 'HIGH' && (
      (recommendation === 'RECOMMENDED' && actualAction === 'rejected') ||
      (recommendation === 'NOT_RECOMMENDED' && actualAction === 'shortlisted')
    )) {
      return true; // Consider as acceptable
    }

    return false;
  }

  /**
   * Update decision engine weights based on feedback
   */
  private async updateWeightsFromFeedback(
    feedback: RecruiterFeedback,
    originalScore: any,
    wasCorrect: boolean
  ): Promise<void> {
    // Get current job's organization for personalized learning
    const prisma = await this.prisma;
    const job = await prisma.job.findUnique({
      where: { id: feedback.jobId },
      select: { organizationId: true }
    });

    if (!job) return;

    const organizationId = job.organizationId;

    // Calculate weight adjustments
    const adjustments = this.calculateWeightAdjustments(
      feedback,
      originalScore,
      wasCorrect
    );

    // Update feedback learning engine
    const actionType = this.mapFeedbackActionToActionType(feedback.action);
    await feedbackLearningEngine.recordAction({
      candidateId: feedback.candidateId,
      jobId: feedback.jobId,
      recruiterId: 'system', // TODO: Get actual recruiter ID from context
      actionType,
      metadata: {
        wasCorrect,
        adjustments,
        confidence: feedback.confidence,
        originalScore
      }
    });
  }

  /**
   * Calculate specific weight adjustments based on feedback
   */
  private calculateWeightAdjustments(
    feedback: RecruiterFeedback,
    originalScore: any,
    wasCorrect: boolean
  ): Record<string, number> {
    const adjustments: Record<string, number> = {};

    // If recommendation was wrong, adjust weights
    if (!wasCorrect) {
      const signalBreakdown = {
        profileSignals: originalScore.profileSignals,
        assessmentSignals: originalScore.assessmentSignals,
        codeIntelligence: originalScore.codeIntelligence,
        interviewSignals: originalScore.interviewSignals,
        behaviorSignals: originalScore.behaviorSignals
      };

      // Find which signals contributed most to the wrong recommendation
      const sortedSignals = Object.entries(signalBreakdown)
        .sort(([,a], [,b]) => (b as number) - (a as number));

      // Slightly reduce weight of the top contributing signal
      const topSignal = sortedSignals[0][0];
      adjustments[topSignal] = -0.05; // 5% reduction

      // Slightly increase weight of underutilized signals
      const lowSignals = sortedSignals.slice(-2); // Bottom 2 signals
      lowSignals.forEach(([signalName]) => {
        adjustments[signalName] = (adjustments[signalName] || 0) + 0.03; // 3% increase
      });
    }

    // Apply explicit signal adjustments from recruiter
    if (feedback.signalAdjustments) {
      Object.entries(feedback.signalAdjustments).forEach(([signal, adjustment]) => {
        adjustments[signal] = (adjustments[signal] || 0) + (adjustment as number) * 0.1; // Scale down explicit adjustments
      });
    }

    return adjustments;
  }

  /**
   * Get learning metrics for an organization
   */
  async getLearningMetrics(organizationId: string): Promise<LearningMetrics> {
    const prisma = await this.prisma;

    // Get all feedback for the organization
    const feedbackData = await prisma.candidateScore.findMany({
      where: {
        job: {
          organizationId
        },
        recruiterFeedback: {
          not: null
        }
      },
      select: {
        recruiterFeedback: true,
        recommendation: true,
        confidence: true
      }
    });

    const totalFeedback = feedbackData.length;
    let correctPredictions = 0;

    feedbackData.forEach((score: any) => {
      if (score.recruiterFeedback) {
        const wasCorrect = this.evaluateRecommendationAccuracy(
          score.recommendation,
          score.recruiterFeedback.action,
          score.confidence
        );
        if (wasCorrect) correctPredictions++;
      }
    });

    const accuracy = totalFeedback > 0 ? (correctPredictions / totalFeedback) * 100 : 0;

    // Get current weights
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

  /**
   * Get feedback summary for a specific job
   */
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
      select: {
        recruiterFeedback: true,
        recommendation: true,
        confidence: true
      }
    });

    const totalCandidates = scores.length;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let correctCount = 0;
    const adjustments: Record<string, number[]> = {};

    scores.forEach((score: any) => {
      if (score.recruiterFeedback) {
        const action = score.recruiterFeedback.action;
        if (action === 'accepted' || action === 'shortlisted') acceptedCount++;
        if (action === 'rejected') rejectedCount++;

        const wasCorrect = this.evaluateRecommendationAccuracy(
          score.recommendation,
          action,
          score.confidence
        );
        if (wasCorrect) correctCount++;

        // Collect adjustments
        if (score.recruiterFeedback.signalAdjustments) {
          Object.entries(score.recruiterFeedback.signalAdjustments).forEach(([signal, adj]) => {
            if (!adjustments[signal]) adjustments[signal] = [];
            adjustments[signal].push(adj as number);
          });
        }
      }
    });

    // Calculate average adjustments
    const commonAdjustments: Record<string, number> = {};
    Object.entries(adjustments).forEach(([signal, values]) => {
      commonAdjustments[signal] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return {
      totalCandidates,
      acceptedCount,
      rejectedCount,
      accuracy: totalCandidates > 0 ? (correctCount / totalCandidates) * 100 : 0,
      commonAdjustments
    };
  }

  /**
   * Map feedback action to ActionType enum
   */
  private mapFeedbackActionToActionType(action: string): ActionType {
    switch (action) {
      case 'accepted':
        return ActionType.HIRED;
      case 'shortlisted':
        return ActionType.SHORTLISTED;
      case 'interviewed':
        return ActionType.INTERVIEWED;
      case 'rejected':
        return ActionType.REJECTED;
      default:
        return ActionType.VIEWED;
    }
  }

  /**
   * Record a decision for learning (called automatically by decision engine)
   */
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
    // Store decision data for future learning
    // This creates a baseline for when recruiter feedback comes in
    const prisma = await this.prisma;

    await prisma.candidateScore.updateMany({
      where: {
        candidateId: decision.candidateId,
        jobId: decision.jobId
      },
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
}

// Export singleton instance
export const learningLoopService = new LearningLoopService();