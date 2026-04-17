// lib/services/usage-service.ts
import { prisma } from '@/lib/prisma';

export interface TrackUsageParams {
  subscriptionId: string;
  metric: string;
  quantity?: number;
}

export interface UsageLimit {
  metric: string;
  limit: number;
  overageRate?: number; // per unit
}

export class UsageService {
  /**
   * Track usage for a metric
   */
  static async trackUsage(params: TrackUsageParams): Promise<void> {
    const { subscriptionId, metric, quantity = 1 } = params;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Find or create usage record for current period
    let usage = await prisma.usage.findFirst({
      where: {
        subscriptionId,
        metric,
        periodStart,
        periodEnd,
      },
    });

    if (usage) {
      await prisma.usage.update({
        where: { id: usage.id },
        data: { quantity: usage.quantity + quantity },
      });
    } else {
      await prisma.usage.create({
        data: {
          subscriptionId,
          metric,
          quantity,
          periodStart,
          periodEnd,
        },
      });
    }
  }

  /**
   * Get current usage for subscription
   */
  static async getCurrentUsage(subscriptionId: string): Promise<any[]> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return prisma.usage.findMany({
      where: {
        subscriptionId,
        periodStart,
        periodEnd,
      },
    });
  }

  /**
   * Check if usage exceeds limit
   */
  static async checkUsageLimit(subscriptionId: string, metric: string, limit: number): Promise<boolean> {
    const usages = await this.getCurrentUsage(subscriptionId);
    const usage = usages.find(u => u.metric === metric);
    return (usage?.quantity || 0) >= limit;
  }

  /**
   * Get usage analytics
   */
  static async getUsageAnalytics(subscriptionId: string, months: number = 6): Promise<any> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const usages = await prisma.usage.findMany({
      where: {
        subscriptionId,
        periodStart: {
          gte: startDate,
        },
      },
      orderBy: {
        periodStart: 'asc',
      },
    });

    // Group by month and metric
    const analytics: any = {};

    usages.forEach(usage => {
      const monthKey = `${usage.periodStart.getFullYear()}-${String(usage.periodStart.getMonth() + 1).padStart(2, '0')}`;
      if (!analytics[monthKey]) {
        analytics[monthKey] = {};
      }
      analytics[monthKey][usage.metric] = usage.quantity;
    });

    return analytics;
  }

  /**
   * Reset monthly usage (call this monthly)
   */
  static async resetMonthlyUsage(): Promise<void> {
    // This would be called by a cron job
    // For now, just archive or reset - but since we have periodStart/End, we don't need to reset
    // New periods will create new records
    console.log('Monthly usage reset - no action needed as usage is period-based');
  }

  /**
   * Handle overage billing
   */
  static async processOverageBilling(subscriptionId: string, limits: UsageLimit[]): Promise<void> {
    const usages = await this.getCurrentUsage(subscriptionId);

    for (const limit of limits) {
      const usage = usages.find(u => u.metric === limit.metric);
      const quantity = usage?.quantity || 0;

      if (quantity > limit.limit && limit.overageRate) {
        const overageQuantity = quantity - limit.limit;
        const overageAmount = overageQuantity * limit.overageRate;

        // Create invoice for overage
        await prisma.invoice.create({
          data: {
            subscriptionId,
            amount: overageAmount,
            currency: 'USD',
            status: 'open',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        console.log(`Processed overage billing for ${subscriptionId}: ${overageAmount} for ${overageQuantity} ${limit.metric}`);
      }
    }
  }
}