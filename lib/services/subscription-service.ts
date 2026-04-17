// lib/services/subscription-service.ts
import { prisma } from '@/lib/prisma';
import { PaymentService } from './payment-service';
import { getPaymentServiceForRegion } from '@/lib/utils/region';

export interface CreateSubscriptionParams {
  organizationId?: string;
  userId?: string;
  planId: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionParams {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
  effectiveDate?: 'immediate' | 'end_of_period';
}

export interface ProrationResult {
  prorationAmount: number;
  description: string;
}

export class SubscriptionService {
  /**
   * Get payment service for entity
   */
  private static async getPaymentService(entityId: string, type: 'organization' | 'user'): Promise<PaymentService> {
    let region = 'global';

    if (type === 'organization') {
      const billing = await prisma.organizationBilling.findUnique({
        where: { organizationId: entityId },
      });
      region = billing?.region || 'global';
    } else {
      // For users, assume global for now, or check user location
      region = 'global';
    }

    return getPaymentServiceForRegion(region as any);
  }
  /**
   * Create a new subscription
   */
  static async createSubscription(params: CreateSubscriptionParams): Promise<any> {
    const plan = await prisma.plan.findUnique({
      where: { id: params.planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Get payment service based on region
    const paymentService = await this.getPaymentService(params.organizationId || params.userId!, params.organizationId ? 'organization' : 'user');

    // Create subscription in payment gateway
    const subscriptionResult = await paymentService.createSubscription({
      customerId: params.organizationId || params.userId!,
      priceId: plan.id, // assume priceId maps to plan
      metadata: {
        organizationId: params.organizationId,
        userId: params.userId,
        planId: params.planId,
      },
    });

    // Create in database
    const subscription = await prisma.subscription.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        planId: params.planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stripeSubscriptionId: subscriptionResult.subscriptionId, // assume stripe for now
      },
    });

    return subscription;
  }

  /**
   * Update subscription (plan change)
   */
  static async updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (params.planId) {
      const newPlan = await prisma.plan.findUnique({
        where: { id: params.planId },
      });

      if (!newPlan) {
        throw new Error('New plan not found');
      }

      // Calculate proration
      const proration = this.calculateProration(subscription, newPlan, params.effectiveDate || 'end_of_period');

      // Update in payment gateway
      const paymentService = await this.getPaymentService(subscription.organizationId || subscription.userId!, subscription.organizationId ? 'organization' : 'user');
      await paymentService.updateSubscription(subscription.stripeSubscriptionId!, {
        priceId: params.planId,
        metadata: { prorationAmount: proration.prorationAmount },
      });

      // Update in database
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          planId: params.planId,
          updatedAt: new Date(),
        },
      });

      // If immediate, update period
      if (params.effectiveDate === 'immediate') {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    if (params.cancelAtPeriodEnd !== undefined) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { cancelAtPeriodEnd: params.cancelAtPeriodEnd },
      });
    }

    return { success: true };
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const paymentService = await this.getPaymentService(subscription.organizationId || subscription.userId!, subscription.organizationId ? 'organization' : 'user');

    if (immediate) {
      await paymentService.cancelSubscription(subscription.stripeSubscriptionId!);
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'canceled', updatedAt: new Date() },
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { cancelAtPeriodEnd: true, updatedAt: new Date() },
      });
    }

    return { success: true };
  }

  /**
   * Calculate proration for plan changes
   */
  static calculateProration(currentSubscription: any, newPlan: any, effectiveDate: string): ProrationResult {
    const now = new Date();
    const periodEnd = new Date(currentSubscription.currentPeriodEnd);
    const totalDays = Math.ceil((periodEnd.getTime() - currentSubscription.currentPeriodStart.getTime()) / (24 * 60 * 60 * 1000));
    const remainingDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    const currentDailyRate = currentSubscription.plan.price / totalDays;
    const newDailyRate = newPlan.price / totalDays;

    const unusedCredit = currentDailyRate * remainingDays;
    const newCharge = newDailyRate * remainingDays;

    const prorationAmount = newCharge - unusedCredit;

    return {
      prorationAmount,
      description: `Proration for ${remainingDays} days: ${prorationAmount > 0 ? 'Charge' : 'Credit'} $${Math.abs(prorationAmount).toFixed(2)}`,
    };
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<any> {
    return prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        usages: true,
        invoices: true,
      },
    });
  }

  /**
   * Get subscriptions for organization or user
   */
  static async getSubscriptions(entityId: string, type: 'organization' | 'user'): Promise<any[]> {
    const where = type === 'organization' ? { organizationId: entityId } : { userId: entityId };

    return prisma.subscription.findMany({
      where,
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}