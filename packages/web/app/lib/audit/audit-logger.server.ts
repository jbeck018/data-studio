import { db } from '../db/db.server';
import { auditLog } from '../db/schema/audit';

export class AuditLogger {
  private static instance: AuditLogger;
  private eventBuffer: Array<{
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, any>;
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
      this.eventBuffer.unshift(...events);
    }
  }

  public async logEvent(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.eventBuffer.push({
      userId,
      action,
      resourceType,
      resourceId,
      metadata: {
        description,
        ...metadata,
      },
    });

    if (this.eventBuffer.length >= 100) {
      await this.flushEvents();
    }
  }

  public async logQueryExecution(
    userId: string,
    connectionId: string,
    sql: string,
    status: string,
    metadata: {
      rowCount?: number;
      executionTime?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.logEvent(
      userId,
      'connection',
      connectionId,
      'QUERY_EXECUTION',
      `Query execution ${status.toLowerCase()}`,
      {
        status,
        sql,
        ...metadata,
      }
    );
  }

  public async logConnectionAccess(
    userId: string,
    organizationId: string,
    connectionId: string,
    status: string,
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
    status: string,
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
    status: string,
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
