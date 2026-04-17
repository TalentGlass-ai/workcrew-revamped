// lib/services/usage-alerts.ts
import { prisma } from '../prisma';
import { UsageService } from './usage-service';

export interface UsageAlert {
  id: string;
  subscriptionId: string;
  metric: string;
  threshold: number; // percentage (0-1)
  currentUsage: number;
  limit: number;
  alertType: 'warning' | 'critical';
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

export interface AlertThreshold {
  metric: string;
  warningThreshold: number; // e.g., 0.8 (80%)
  criticalThreshold: number; // e.g., 0.95 (95%)
}

export class UsageAlertsService {
  private static readonly DEFAULT_THRESHOLDS: Record<string, AlertThreshold> = {
    jobs_posted: { warningThreshold: 0.8, criticalThreshold: 0.95 },
    applications_received: { warningThreshold: 0.8, criticalThreshold: 0.95 },
    candidate_searches: { warningThreshold: 0.8, criticalThreshold: 0.95 },
    api_calls: { warningThreshold: 0.8, criticalThreshold: 0.95 },
  };

  /**
   * Check usage against thresholds and create alerts
   */
  static async checkAndCreateAlerts(subscriptionId: string): Promise<UsageAlert[]> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentUsage = await UsageService.getCurrentUsage(subscriptionId);
    const limits = subscription.plan.limits || {};
    const alerts: UsageAlert[] = [];

    for (const [metric, limit] of Object.entries(limits)) {
      const usage = currentUsage.find(u => u.metric === metric);
      const currentUsageValue = usage?.quantity || 0;
      const limitValue = limit as number;

      if (limitValue > 0) {
        const usageRate = currentUsageValue / limitValue;
        const thresholds = this.DEFAULT_THRESHOLDS[metric] || { warningThreshold: 0.8, criticalThreshold: 0.95 };

        let alertType: 'warning' | 'critical' | null = null;
        if (usageRate >= thresholds.criticalThreshold) {
          alertType = 'critical';
        } else if (usageRate >= thresholds.warningThreshold) {
          alertType = 'warning';
        }

        if (alertType) {
          // Check if alert already exists and is not acknowledged
          const existingAlert = await prisma.usageAlert.findFirst({
            where: {
              subscriptionId,
              metric,
              acknowledgedAt: null,
            },
            orderBy: { createdAt: 'desc' },
          });

          // Only create new alert if no recent unacknowledged alert
          if (!existingAlert || (new Date().getTime() - existingAlert.createdAt.getTime()) > 24 * 60 * 60 * 1000) { // 24 hours
            const alert = await prisma.usageAlert.create({
              data: {
                subscriptionId,
                metric,
                threshold: usageRate,
                currentUsage: currentUsageValue,
                limit: limitValue,
                alertType,
                message: this.generateAlertMessage(metric, currentUsageValue, limitValue, alertType),
              },
            });

            alerts.push({
              id: alert.id,
              subscriptionId,
              metric,
              threshold: usageRate,
              currentUsage: currentUsageValue,
              limit: limitValue,
              alertType,
              message: alert.message,
              createdAt: alert.createdAt,
            });

            // Send notification (could integrate with email/SMS service)
            await this.sendAlertNotification(subscription.user, alert);
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Get active alerts for a subscription
   */
  static async getActiveAlerts(subscriptionId: string): Promise<UsageAlert[]> {
    const alerts = await prisma.usageAlert.findMany({
      where: {
        subscriptionId,
        acknowledgedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(alert => ({
      id: alert.id,
      subscriptionId: alert.subscriptionId,
      metric: alert.metric,
      threshold: alert.threshold,
      currentUsage: alert.currentUsage,
      limit: alert.limit,
      alertType: alert.alertType as 'warning' | 'critical',
      message: alert.message,
      createdAt: alert.createdAt,
      acknowledgedAt: alert.acknowledgedAt,
    }));
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.usageAlert.findUnique({
      where: { id: alertId },
      include: { subscription: true },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.subscription.userId !== userId) {
      throw new Error('Unauthorized to acknowledge this alert');
    }

    await prisma.usageAlert.update({
      where: { id: alertId },
      data: { acknowledgedAt: new Date() },
    });
  }

  /**
   * Generate alert message
   */
  private static generateAlertMessage(
    metric: string,
    currentUsage: number,
    limit: number,
    alertType: 'warning' | 'critical'
  ): string {
    const percentage = Math.round((currentUsage / limit) * 100);
    const metricName = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (alertType === 'critical') {
      return `🚨 Critical: You've used ${percentage}% of your ${metricName} limit (${currentUsage}/${limit}). Upgrade now to avoid service interruption.`;
    } else {
      return `⚠️ Warning: You've used ${percentage}% of your ${metricName} limit (${currentUsage}/${limit}). Consider upgrading your plan.`;
    }
  }

  /**
   * Send alert notification (placeholder for email/SMS integration)
   */
  private static async sendAlertNotification(user: any, alert: any): Promise<void> {
    // TODO: Integrate with notification service
    console.log(`Sending ${alert.alertType} alert to ${user.email}: ${alert.message}`);

    // Could send email, SMS, in-app notification, etc.
    // For now, just log it
  }

  /**
   * Get usage summary with alerts
   */
  static async getUsageSummaryWithAlerts(subscriptionId: string): Promise<{
    usage: any[];
    alerts: UsageAlert[];
  }> {
    const [usage, alerts] = await Promise.all([
      UsageService.getCurrentUsage(subscriptionId),
      this.getActiveAlerts(subscriptionId),
    ]);

    return { usage, alerts };
  }
}