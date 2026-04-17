// lib/middleware/usage-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { UsageService } from '../services/usage-service';
import { prisma } from '../prisma';

export interface UsageTrackedRequest extends NextRequest {
  subscriptionId?: string;
}

/**
 * Middleware to track usage for metered features
 */
export async function withUsageTracking(
  handler: (req: UsageTrackedRequest) => Promise<NextResponse>,
  metric: string,
  getEntityId: (req: NextRequest) => Promise<{ id: string; type: 'organization' | 'user' } | null>
) {
  return async (req: UsageTrackedRequest): Promise<NextResponse> => {
    try {
      // Get entity from request
      const entity = await getEntityId(req);

      if (!entity) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          [entity.type === 'organization' ? 'organizationId' : 'userId']: entity.id,
          status: 'active',
        },
      });

      if (!subscription) {
        return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
      }

      // Check usage limit before proceeding
      const plan = await prisma.plan.findUnique({
        where: { id: subscription.planId },
      });

      if (plan?.limits && plan.limits[metric]) {
        const exceeded = await UsageService.checkUsageLimit(subscription.id, metric, plan.limits[metric]);
        if (exceeded) {
          return NextResponse.json({ error: 'Usage limit exceeded' }, { status: 429 });
        }
      }

      // Track usage
      await UsageService.trackUsage({
        subscriptionId: subscription.id,
        metric,
      });

      // Add subscription to request
      req.subscriptionId = subscription.id;

      // Call the handler
      return handler(req);
    } catch (error) {
      console.error('Usage tracking error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Helper to get organization from request (assuming auth middleware sets user)
 */
export async function getOrganizationFromRequest(req: NextRequest): Promise<{ id: string; type: 'organization' } | null> {
  // This would depend on your auth setup
  // Assume req.user is set by auth middleware
  const user = (req as any).user;
  if (!user?.organizationId) {
    return null;
  }

  return { id: user.organizationId, type: 'organization' };
}

/**
 * Helper to get user from request
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ id: string; type: 'user' } | null> {
  const user = (req as any).user;
  if (!user?.id) {
    return null;
  }

  return { id: user.id, type: 'user' };
}