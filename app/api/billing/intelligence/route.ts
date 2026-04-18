// app/api/billing/intelligence/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { UpgradeSuggestionsService } from '../../../../lib/services/upgrade-suggestions';
import { UsageAlertsService } from '../../../../lib/services/usage-alerts';
import { BillingIntelligenceService } from '../../../../lib/services/billing-intelligence';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const userId = session.user.id;

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const results: any = {};

    if (type === 'all' || type === 'suggestions') {
      results.upgradeSuggestions = await UpgradeSuggestionsService.getPersonalizedSuggestions(userId);
    }

    if (type === 'all' || type === 'alerts') {
      results.usageAlerts = await UsageAlertsService.getActiveAlerts(subscription.id);
    }

    if (type === 'all' || type === 'pricing') {
      results.optimalPricing = await BillingIntelligenceService.getOptimalPricing(userId);
    }

    if (type === 'all' || type === 'insights') {
      results.revenueInsights = await BillingIntelligenceService.getRevenueInsights();
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Billing intelligence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    const userId = session.user.id;

    switch (action) {
      case 'acknowledge_alert': {
        const { alertId } = data;
        await UsageAlertsService.acknowledgeAlert(alertId, userId);
        return NextResponse.json({ success: true });
      }

      case 'check_alerts': {
        const subscription = await prisma.subscription.findFirst({
          where: { userId },
        });
        if (!subscription) {
          return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }
        const alerts = await UsageAlertsService.checkAndCreateAlerts(subscription.id);
        return NextResponse.json({ alerts });
      }

      case 'create_ab_test': {
        const test = await BillingIntelligenceService.createABTest(data);
        return NextResponse.json({ test });
      }

      case 'record_conversion': {
        const { testId, group, revenue } = data;
        await BillingIntelligenceService.recordConversion(testId, group, revenue);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing intelligence POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}