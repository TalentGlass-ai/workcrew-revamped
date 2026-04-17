// scripts/reset-usage.ts
import { UsageService } from '../lib/services/usage-service';
import { SubscriptionService } from '../lib/services/subscription-service';
import { prisma } from '../lib/prisma';

async function resetMonthlyUsage() {
  console.log('Starting monthly usage reset...');

  try {
    // Reset usage (though it's period-based, this could archive old data if needed)
    await UsageService.resetMonthlyUsage();

    // Process overage billing for all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: { plan: true },
    });

    for (const subscription of subscriptions) {
      if (subscription.plan.limits) {
        const limits = Object.entries(subscription.plan.limits).map(([metric, limit]) => ({
          metric,
          limit: limit as number,
          overageRate: (subscription.plan as any).overageRates?.[metric] || 0,
        }));

        await UsageService.processOverageBilling(subscription.id, limits);
      }
    }

    console.log('Monthly usage reset completed successfully');
  } catch (error) {
    console.error('Error during monthly usage reset:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetMonthlyUsage();
}

export { resetMonthlyUsage };