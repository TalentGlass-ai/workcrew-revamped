// lib/services/upgrade-suggestions.ts
import { prisma } from '../prisma';
import { UsageService } from './usage-service';
import { PlanService } from './plan-service';

export interface UpgradeSuggestion {
  subscriptionId: string;
  currentPlanId: string;
  suggestedPlanId: string;
  reason: string;
  confidence: number; // 0-1
  potentialSavings?: number;
  expectedRevenue?: number;
}

export interface UsagePattern {
  metric: string;
  currentUsage: number;
  limit: number;
  usageRate: number; // percentage of limit used
  trend: 'increasing' | 'stable' | 'decreasing';
}

export class UpgradeSuggestionsService {
  /**
   * Analyze usage patterns and suggest upgrades
   */
  static async analyzeUpgradeSuggestions(subscriptionId: string): Promise<UpgradeSuggestion[]> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentPlan = subscription.plan;
    const usagePatterns = await this.getUsagePatterns(subscriptionId, currentPlan);
    const suggestions: UpgradeSuggestion[] = [];

    // Check each usage pattern
    for (const pattern of usagePatterns) {
      if (pattern.usageRate > 0.8) { // Using more than 80% of limit
        const higherTierPlans = await PlanService.getPlans(currentPlan.type);

        // Find next higher tier plan
        const currentTierIndex = this.getTierIndex(currentPlan.tier);
        const nextTierPlan = higherTierPlans.find(p =>
          this.getTierIndex(p.tier) > currentTierIndex
        );

        if (nextTierPlan) {
          const reason = `High usage of ${pattern.metric}: ${pattern.currentUsage}/${pattern.limit} (${Math.round(pattern.usageRate * 100)}%)`;
          const confidence = Math.min(pattern.usageRate, 0.95); // Higher usage = higher confidence

          suggestions.push({
            subscriptionId,
            currentPlanId: currentPlan.id,
            suggestedPlanId: nextTierPlan.id,
            reason,
            confidence,
            potentialSavings: this.calculatePotentialSavings(currentPlan, nextTierPlan, pattern),
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Get usage patterns for a subscription
   */
  private static async getUsagePatterns(subscriptionId: string, plan: any): Promise<UsagePattern[]> {
    const currentUsage = await UsageService.getCurrentUsage(subscriptionId);
    const limits = plan.limits || {};

    const patterns: UsagePattern[] = [];

    for (const [metric, limit] of Object.entries(limits)) {
      const usage = currentUsage.find(u => u.metric === metric);
      const currentUsageValue = usage?.quantity || 0;
      const limitValue = limit as number;

      if (limitValue > 0) {
        const usageRate = currentUsageValue / limitValue;

        // Simple trend analysis (could be enhanced with historical data)
        const trend = usageRate > 0.5 ? 'increasing' : 'stable';

        patterns.push({
          metric,
          currentUsage: currentUsageValue,
          limit: limitValue,
          usageRate,
          trend,
        });
      }
    }

    return patterns;
  }

  /**
   * Get tier hierarchy index
   */
  private static getTierIndex(tier: string): number {
    const tiers = ['free', 'starter', 'professional', 'enterprise'];
    return tiers.indexOf(tier.toLowerCase());
  }

  /**
   * Calculate potential savings (simplified)
   */
  private static calculatePotentialSavings(currentPlan: any, suggestedPlan: any, pattern: UsagePattern): number {
    // If overage rates exist, calculate savings from unlimited usage
    const overageRate = currentPlan.limits?.[`${pattern.metric}_overage`] || 0;
    const overageAmount = Math.max(0, pattern.currentUsage - pattern.limit) * overageRate;

    // Assume suggested plan has higher limit, so less overage
    const suggestedLimit = suggestedPlan.limits?.[pattern.metric] || pattern.limit * 2;
    const suggestedOverage = Math.max(0, pattern.currentUsage - suggestedLimit) * overageRate;

    return overageAmount - suggestedOverage;
  }

  /**
   * Get personalized upgrade recommendations
   */
  static async getPersonalizedSuggestions(userId: string): Promise<UpgradeSuggestion[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
    });

    const allSuggestions: UpgradeSuggestion[] = [];

    for (const subscription of subscriptions) {
      const suggestions = await this.analyzeUpgradeSuggestions(subscription.id);
      allSuggestions.push(...suggestions);
    }

    // Sort by confidence
    return allSuggestions.sort((a, b) => b.confidence - a.confidence);
  }
}