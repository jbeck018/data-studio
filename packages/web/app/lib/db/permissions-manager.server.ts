import { db } from './db.server';
import { eq, and } from 'drizzle-orm';
import { organizationMembers, connectionPermissions } from './schema';
import type { QueryRestriction } from './types';

export interface ConnectionPermission {
  userId: string;
  organizationId: string;
  connectionId: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PermissionsManager {
  async hasConnectionAccess(
    userId: string,
    organizationId: string,
    connectionId: string
  ): Promise<boolean> {
    const permissions = await db.query.connectionPermissions.findFirst({
      where: and(
        eq(connectionPermissions.userId, userId),
        eq(connectionPermissions.organizationId, organizationId),
        eq(connectionPermissions.connectionId, connectionId)
      ),
    });

    return !!permissions;
  }

  async isConnectionAdmin(
    userId: string,
    organizationId: string,
    connectionId: string
  ): Promise<boolean> {
    const permissions = await db.query.connectionPermissions.findFirst({
      where: and(
        eq(connectionPermissions.userId, userId),
        eq(connectionPermissions.organizationId, organizationId),
        eq(connectionPermissions.connectionId, connectionId)
      ),
    });

    return permissions?.isAdmin ?? false;
  }

  async getConnectionPermissions(
    userId: string,
    organizationId: string,
    connectionId: string
  ): Promise<ConnectionPermission | null> {
    return db.query.connectionPermissions.findFirst({
      where: and(
        eq(connectionPermissions.userId, userId),
        eq(connectionPermissions.organizationId, organizationId),
        eq(connectionPermissions.connectionId, connectionId)
      ),
    });
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
      .where(and(
        eq(connectionPermissions.userId, userId),
        eq(connectionPermissions.organizationId, organizationId),
        eq(connectionPermissions.connectionId, connectionId)
      ));
  }

  async grantConnectionAccess(
    userId: string,
    organizationId: string,
    connectionId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    await db.insert(connectionPermissions).values({
      userId,
      organizationId,
      connectionId,
      isAdmin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const permissionsManager = new PermissionsManager();
