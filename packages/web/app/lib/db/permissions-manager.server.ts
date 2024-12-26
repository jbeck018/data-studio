import { db } from './db.server';
import { eq, and } from 'drizzle-orm';
import { connectionPermissions } from './schema/permissions';
import { organizationMembers } from './schema/organizations';
import { v4 as uuidv4 } from 'uuid';

export interface ConnectionPermission {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId: string;
  connectionId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canGrant: boolean;
}

export type SQLOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';

export interface QueryRestrictions {
  maxRowsPerQuery: number;
  allowedSchemas: string[];
  allowedTables: string[];
  allowedOperations: SQLOperation[];
}

export class PermissionsManager {
  private defaultRestrictions: QueryRestrictions = {
    maxRowsPerQuery: 1000,
    allowedSchemas: ['public'],
    allowedTables: [],
    allowedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
  };

  async hasConnectionPermission(userId: string, connectionId: string): Promise<boolean> {
    const result = await db.select()
      .from(connectionPermissions)
      .where(
        and(
          eq(connectionPermissions.userId, userId),
          eq(connectionPermissions.connectionId, connectionId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async isConnectionAdmin(
    userId: string,
    organizationId: string,
    connectionId: string
  ): Promise<boolean> {
    const result = await db.select()
      .from(connectionPermissions)
      .where(
        and(
          eq(connectionPermissions.userId, userId),
          eq(connectionPermissions.organizationId, organizationId),
          eq(connectionPermissions.connectionId, connectionId)
        )
      )
      .limit(1);

    return result[0]?.canGrant ?? false;
  }

  async getConnectionPermissions(
    userId: string,
    organizationId: string,
    connectionId: string
  ): Promise<ConnectionPermission | null> {
    const result = await db.select()
      .from(connectionPermissions)
      .where(
        and(
          eq(connectionPermissions.userId, userId),
          eq(connectionPermissions.organizationId, organizationId),
          eq(connectionPermissions.connectionId, connectionId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  async updateConnectionPermissions(
    userId: string,
    organizationId: string,
    connectionId: string,
    updates: Partial<ConnectionPermission>
  ): Promise<void> {
    await db.update(connectionPermissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(connectionPermissions.userId, userId),
          eq(connectionPermissions.organizationId, organizationId),
          eq(connectionPermissions.connectionId, connectionId)
        )
      );
  }

  async grantConnectionPermission(
    connectionId: string,
    userId: string,
    organizationId: string,
    permissions: {
      canRead?: boolean;
      canWrite?: boolean;
      canDelete?: boolean;
      canGrant?: boolean;
    }
  ): Promise<ConnectionPermission> {
    const [permission] = await db.insert(connectionPermissions)
      .values({
        id: uuidv4(),
        userId,
        organizationId,
        connectionId,
        canRead: permissions.canRead ?? false,
        canWrite: permissions.canWrite ?? false,
        canDelete: permissions.canDelete ?? false,
        canGrant: permissions.canGrant ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return permission;
  }

  async revokeConnectionPermission(
    connectionId: string,
    userId: string
  ): Promise<void> {
    await db.delete(connectionPermissions)
      .where(
        and(
          eq(connectionPermissions.userId, userId),
          eq(connectionPermissions.connectionId, connectionId)
        )
      );
  }

  getQueryRestrictions(userId: string, organizationId: string): QueryRestrictions {
    // TODO: Implement per-user/organization restrictions
    return this.defaultRestrictions;
  }

  async validateQuery(
    sql: string,
    userId: string,
    organizationId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      const restrictions = this.getQueryRestrictions(userId, organizationId);
      
      // TODO: Implement proper SQL validation
      // For now, just check if it's not empty
      if (!sql.trim()) {
        return {
          isValid: false,
          error: 'Query cannot be empty'
        };
      }

      return {
        isValid: true
      };
    } catch (error) {
      const err = error as Error;
      return {
        isValid: false,
        error: err.message
      };
    }
  }
}

export const permissionsManager = new PermissionsManager();
