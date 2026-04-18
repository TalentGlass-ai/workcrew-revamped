// lib/services/audit-logger.ts
import { prisma } from '../prisma';

export interface AuditEvent {
  id: string;
  userId?: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogQuery {
  userId?: string;
  organizationId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditEvent['severity'];
  limit?: number;
  offset?: number;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: event.userId,
          organizationId: event.organizationId,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          details: event.details,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          severity: event.severity,
        },
      });
    } catch (error) {
      // Log to console if database logging fails
      console.error('Failed to log audit event:', error, event);
      // Could send to external logging service
    }
  }

  /**
   * Log billing-related events
   */
  static async logBillingEvent(
    userId: string | undefined,
    organizationId: string | undefined,
    action: string,
    details: Record<string, any>,
    severity: AuditEvent['severity'] = 'medium'
  ): Promise<void> {
    await this.logEvent({
      userId,
      organizationId,
      action,
      resource: 'billing',
      details,
      severity,
    });
  }

  /**
   * Log payment events
   */
  static async logPaymentEvent(
    userId: string | undefined,
    organizationId: string | undefined,
    paymentId: string,
    action: string,
    amount: number,
    currency: string,
    gateway: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logBillingEvent(
      userId,
      organizationId,
      action,
      {
        paymentId,
        amount,
        currency,
        gateway,
        ...details,
      },
      action === 'payment_failed' ? 'high' : 'medium'
    );
  }

  /**
   * Log subscription events
   */
  static async logSubscriptionEvent(
    userId: string | undefined,
    organizationId: string | undefined,
    subscriptionId: string,
    action: string,
    planId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logBillingEvent(
      userId,
      organizationId,
      action,
      {
        subscriptionId,
        planId,
        ...details,
      },
      'medium'
    );
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    userId: string | undefined,
    organizationId: string | undefined,
    action: string,
    details: Record<string, any>,
    severity: AuditEvent['severity'] = 'high'
  ): Promise<void> {
    await this.logEvent({
      userId,
      organizationId,
      action,
      resource: 'security',
      details,
      severity,
    });
  }

  /**
   * Query audit logs
   */
  static async queryLogs(query: AuditLogQuery): Promise<AuditEvent[]> {
    const where: any = {};

    if (query.userId) where.userId = query.userId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    if (query.severity) where.severity = query.severity;

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) where.timestamp.gte = query.startDate;
      if (query.endDate) where.timestamp.lte = query.endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: query.limit || 100,
      skip: query.offset || 0,
    });

    return logs.map((log: any) => ({
      id: log.id,
      userId: log.userId || undefined,
      organizationId: log.organizationId || undefined,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || undefined,
      details: log.details as Record<string, any>,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      timestamp: log.timestamp,
      severity: log.severity as AuditEvent['severity'],
    }));
  }

  /**
   * Get audit summary for compliance
   */
  static async getAuditSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByAction: Record<string, number>;
    recentEvents: AuditEvent[];
  }> {
    const logs = await this.queryLogs({
      organizationId,
      startDate,
      endDate,
      limit: 1000,
    });

    const eventsBySeverity: Record<string, number> = {};
    const eventsByAction: Record<string, number> = {};

    logs.forEach(log => {
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
    });

    return {
      totalEvents: logs.length,
      eventsBySeverity,
      eventsByAction,
      recentEvents: logs.slice(0, 10),
    };
  }

  /**
   * Export audit logs for compliance (GDPR/SOX)
   */
  static async exportAuditLogs(
    query: AuditLogQuery,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.queryLogs({ ...query, limit: 10000 });

    if (format === 'csv') {
      const headers = ['timestamp', 'userId', 'organizationId', 'action', 'resource', 'resourceId', 'severity', 'details', 'ipAddress', 'userAgent'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.userId || '',
          log.organizationId || '',
          log.action,
          log.resource,
          log.resourceId || '',
          log.severity,
          JSON.stringify(log.details).replace(/"/g, '""'),
          log.ipAddress || '',
          log.userAgent || '',
        ].map(field => `"${field}"`).join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }
}

// Database model needed:
// model AuditLog {
//   id             String   @id @default(uuid())
//   userId         String?
//   organizationId String?
//   action         String
//   resource       String
//   resourceId     String?
//   details        Json
//   ipAddress      String?
//   userAgent      String?
//   timestamp      DateTime @default(now())
//   severity       String   @default("medium") // low, medium, high, critical
//
//   @@map("audit_logs")
// }