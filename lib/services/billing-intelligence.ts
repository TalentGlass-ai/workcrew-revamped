// lib/services/billing-intelligence.ts
import { prisma } from '../prisma';
import { PlanService } from './plan-service';
import { UsageService } from './usage-service';

export interface PricingStrategy {
  id: string;
  name: string;
  type: 'fixed' | 'dynamic' | 'tiered';
  parameters: Record<string, any>;
  isActive: boolean;
  conversionRate?: number;
  revenue?: number;
}

export interface ABTest {
  id: string;
  name: string;
  strategyA: PricingStrategy;
  strategyB: PricingStrategy;
  startDate: Date;
  endDate?: Date;
  targetUsers: number;
  currentParticipants: number;
  results?: {
    strategyA: { conversions: number; revenue: number };
    strategyB: { conversions: number; revenue: number };
  };
}

export interface DynamicPricingRule {
  condition: string; // e.g., "usage > 80%"
  adjustment: number; // percentage adjustment
  reason: string;
}

export class BillingIntelligenceService {
  /**
   * Get optimal pricing for a user based on their usage patterns
   */
  static async getOptimalPricing(userId: string): Promise<{
    currentPlan: any;
    recommendedPrice: number;
    reasoning: string;
    confidence: number;
  }> {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const usage = await UsageService.getCurrentUsage(subscription.id);
    const usagePatterns = await this.analyzeUsagePatterns(usage, subscription.plan);

    const optimalPrice = await this.calculateOptimalPrice(subscription.plan, usagePatterns);

    return {
      currentPlan: subscription.plan,
      recommendedPrice: optimalPrice.price,
      reasoning: optimalPrice.reasoning,
      confidence: optimalPrice.confidence,
    };
  }

  /**
   * Analyze usage patterns for pricing optimization
   */
  private static async analyzeUsagePatterns(usage: any[], plan: any): Promise<any> {
    const patterns = {
      highUtilization: false,
      growingUsage: false,
      peakUsage: false,
      averageUtilization: 0,
    };

    const limits = plan.limits || {};
    let totalUtilization = 0;
    let metricCount = 0;

    for (const usageRecord of usage) {
      const limit = limits[usageRecord.metric];
      if (limit) {
        const utilization = usageRecord.quantity / limit;
        totalUtilization += utilization;
        metricCount++;

        if (utilization > 0.8) {
          patterns.highUtilization = true;
        }
      }
    }

    patterns.averageUtilization = metricCount > 0 ? totalUtilization / metricCount : 0;

    // Check for growing usage (simplified - would need historical data)
    patterns.growingUsage = patterns.averageUtilization > 0.6;

    return patterns;
  }

  /**
   * Calculate optimal price based on usage patterns
   */
  private static async calculateOptimalPrice(plan: any, patterns: any): Promise<{
    price: number;
    reasoning: string;
    confidence: number;
  }> {
    let adjustment = 0;
    let reasoning = '';
    let confidence = 0.5;

    if (patterns.highUtilization) {
      adjustment = 0.2; // 20% increase
      reasoning = 'High utilization of plan limits suggests value in upgrading';
      confidence = 0.8;
    } else if (patterns.growingUsage) {
      adjustment = 0.1; // 10% increase
      reasoning = 'Growing usage patterns indicate increasing value';
      confidence = 0.6;
    } else if (patterns.averageUtilization < 0.3) {
      adjustment = -0.1; // 10% discount
      reasoning = 'Low utilization suggests potential for cost optimization';
      confidence = 0.7;
    }

    const recommendedPrice = plan.price * (1 + adjustment);

    return {
      price: Math.round(recommendedPrice * 100) / 100, // Round to 2 decimals
      reasoning,
      confidence,
    };
  }

  /**
   * Create A/B test for pricing strategies
   */
  static async createABTest(params: {
    name: string;
    strategyA: Omit<PricingStrategy, 'id'>;
    strategyB: Omit<PricingStrategy, 'id'>;
    durationDays: number;
    targetUsers: number;
  }): Promise<ABTest> {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

    const test = await prisma.aBTest.create({
      data: {
        name: params.name,
        strategyA: params.strategyA,
        strategyB: params.strategyB,
        startDate,
        endDate,
        targetUsers: params.targetUsers,
        currentParticipants: 0,
      },
    });

    return {
      id: test.id,
      name: test.name,
      strategyA: test.strategyA as PricingStrategy,
      strategyB: test.strategyB as PricingStrategy,
      startDate: test.startDate,
      endDate: test.endDate,
      targetUsers: test.targetUsers,
      currentParticipants: test.currentParticipants,
    };
  }

  /**
   * Assign user to A/B test group
   */
  static async assignToABTest(userId: string): Promise<{
    testId: string;
    group: 'A' | 'B';
    strategy: PricingStrategy;
  } | null> {
    const activeTests = await prisma.aBTest.findMany({
      where: {
        endDate: { gt: new Date() },
        currentParticipants: { lt: prisma.aBTest.fields.targetUsers },
      },
    });

    if (activeTests.length === 0) {
      return null;
    }

    // Simple random assignment (could be more sophisticated)
    const test = activeTests[0];
    const group = Math.random() < 0.5 ? 'A' : 'B';
    const strategy = group === 'A' ? test.strategyA : test.strategyB;

    // Record participation
    await prisma.aBTest.update({
      where: { id: test.id },
      data: { currentParticipants: { increment: 1 } },
    });

    return {
      testId: test.id,
      group,
      strategy: strategy as PricingStrategy,
    };
  }

  /**
   * Record conversion in A/B test
   */
  static async recordConversion(testId: string, group: 'A' | 'B', revenue: number): Promise<void> {
    const test = await prisma.aBTest.findUnique({ where: { id: testId } });
    if (!test) return;

    const results = test.results || { strategyA: { conversions: 0, revenue: 0 }, strategyB: { conversions: 0, revenue: 0 } };

    if (group === 'A') {
      results.strategyA.conversions += 1;
      results.strategyA.revenue += revenue;
    } else {
      results.strategyB.conversions += 1;
      results.strategyB.revenue += revenue;
    }

    await prisma.aBTest.update({
      where: { id: test.id },
      data: { results },
    });
  }

  /**
   * Get A/B test results
   */
  static async getABTestResults(testId: string): Promise<ABTest | null> {
    const test = await prisma.aBTest.findUnique({ where: { id: testId } });
    if (!test) return null;

    return {
      id: test.id,
      name: test.name,
      strategyA: test.strategyA as PricingStrategy,
      strategyB: test.strategyB as PricingStrategy,
      startDate: test.startDate,
      endDate: test.endDate,
      targetUsers: test.targetUsers,
      currentParticipants: test.currentParticipants,
      results: test.results as any,
    };
  }

  /**
   * Get revenue optimization insights
   */
  static async getRevenueInsights(): Promise<{
    totalRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    upgradeRate: number;
    topPerformingPlans: any[];
  }> {
    // This would require more complex queries and historical data
    // Simplified implementation
    const subscriptions = await prisma.subscription.findMany({
      include: { plan: true },
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.plan.price, 0);
    const averageRevenuePerUser = totalRevenue / subscriptions.length;

    return {
      totalRevenue,
      averageRevenuePerUser,
      churnRate: 0.05, // Placeholder
      upgradeRate: 0.15, // Placeholder
      topPerformingPlans: [], // Would need analytics
    };
  }
}