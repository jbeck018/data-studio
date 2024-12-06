import { db } from '../db/db.server';
import { auditLog } from '../db/schema/audit';
import type {
  AuditEventType,
  AuditEventStatus,
  AuditEventMetadata,
} from '../db/schema/audit';

export class AuditLogger {
  private static instance: AuditLogger;
  private eventBuffer: Array<{
    userId: string;
    organizationId: string;
    eventType: AuditEventType;
    eventStatus: AuditEventStatus;
    description: string;
    metadata?: AuditEventMetadata;
  }>;
  private flushInterval: NodeJS.Timeout | null;

  private constructor() {
    this.eventBuffer = [];
    this.flushInterval = null;
    this.startFlushInterval();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private startFlushInterval(): void {
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
    }

    this.flushInterval = setTimeout(
      () => this.flushEvents(),
      5000 // Flush every 5 seconds
    );
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await db.insert(auditLog).values(events);
    } catch (error) {
      console.error('Failed to flush audit events:', error);
      // Put events back in buffer
      this.eventBuffer.unshift(...events);
    }
  }

  public async logEvent(
    userId: string,
    organizationId: string,
    eventType: AuditEventType,
    eventStatus: AuditEventStatus,
    description: string,
    metadata?: AuditEventMetadata
  ): Promise<void> {
    this.eventBuffer.push({
      userId,
      organizationId,
      eventType,
      eventStatus,
      description,
      metadata,
    });

    // If buffer gets too large, flush immediately
    if (this.eventBuffer.length >= 100) {
      await this.flushEvents();
    }
  }

  public async logQueryExecution(
    userId: string,
    organizationId: string,
    connectionId: string,
    sql: string,
    status: AuditEventStatus,
    metadata: {
      rowCount?: number;
      executionTime?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.logEvent(
      userId,
      organizationId,
      'QUERY_EXECUTION',
      status,
      `Query execution ${status.toLowerCase()}`,
      {
        connectionId,
        sql,
        ...metadata,
      }
    );
  }

  public async logConnectionAccess(
    userId: string,
    organizationId: string,
    connectionId: string,
    status: AuditEventStatus,
    metadata?: {
      errorMessage?: string;
      ipAddress?: string;
      userAgent?: string;
      additionalInfo?: Record<string, any>;
    }
  ): Promise<void> {
    await this.logEvent(
      userId,
      organizationId,
      'CONNECTION_ACCESS',
      status,
      `Connection access ${status.toLowerCase()}`,
      {
        connectionId,
        ...metadata,
      }
    );
  }

  public async logPermissionChange(
    userId: string,
    organizationId: string,
    targetUserId: string,
    connectionId: string,
    oldValue: any,
    newValue: any
  ): Promise<void> {
    await this.logEvent(
      userId,
      organizationId,
      'PERMISSION_CHANGE',
      'SUCCESS',
      'Permission settings modified',
      {
        connectionId,
        targetUserId,
        oldValue,
        newValue,
      }
    );
  }

  public async logSecurityEvent(
    userId: string,
    organizationId: string,
    description: string,
    status: AuditEventStatus,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      targetResource?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.logEvent(
      userId,
      organizationId,
      'SECURITY_EVENT',
      status,
      description,
      metadata
    );
  }

  public async logUserAction(
    userId: string,
    organizationId: string,
    description: string,
    status: AuditEventStatus,
    metadata?: {
      targetResource?: string;
      additionalInfo?: Record<string, any>;
    }
  ): Promise<void> {
    await this.logEvent(
      userId,
      organizationId,
      'USER_ACTION',
      status,
      description,
      metadata
    );
  }

  public async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = null;
    }

    await this.flushEvents();
  }
}

export const auditLogger = AuditLogger.getInstance();
