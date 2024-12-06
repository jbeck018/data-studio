import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.server';
import { databaseConnections } from '../schema/connections';
import { connectionPermissions } from '../schema/permissions';
import { users } from '../schema/auth';
import { organizations } from '../schema/organizations';
import type { ConnectionConfig } from '../schema/connections';
import type { QueryRestriction } from '../schema/permissions';

export interface TestUser {
  id: string;
  email: string;
  organizationId: string;
}

export interface TestConnection {
  id: string;
  name: string;
  type: string;
  config: ConnectionConfig;
}

export interface TestPermission {
  isAdmin?: boolean;
  canConnect?: boolean;
  queryRestrictions?: QueryRestriction;
}

export async function createTestUser(): Promise<TestUser> {
  const organizationId = uuidv4();
  const userId = uuidv4();
  
  await db.insert(organizations).values({
    id: organizationId,
    name: 'Test Organization',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(users).values({
    id: userId,
    email: `test-${userId}@example.com`,
    organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: userId,
    email: `test-${userId}@example.com`,
    organizationId,
  };
}

export async function createTestConnection(name: string = 'Test Connection'): Promise<TestConnection> {
  const connectionId = uuidv4();
  
  const connection = {
    id: connectionId,
    name,
    type: 'POSTGRES',
    config: {
      type: 'POSTGRES',
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      username: 'test_user',
      password: 'test_password',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
  };

  await db.insert(databaseConnections).values(connection);

  return {
    id: connectionId,
    name,
    type: 'POSTGRES',
    config: connection.config,
  };
}

export async function setTestPermissions(
  connectionId: string,
  userId: string,
  organizationId: string,
  permissions: TestPermission
): Promise<void> {
  await db.insert(connectionPermissions).values({
    id: uuidv4(),
    connectionId,
    userId,
    organizationId,
    isAdmin: permissions.isAdmin ?? false,
    canConnect: permissions.canConnect ?? true,
    queryRestrictions: permissions.queryRestrictions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function cleanupTestData(
  userId: string,
  connectionId: string,
  organizationId: string
): Promise<void> {
  await db.delete(connectionPermissions).where(eq => ({
    userId: eq(connectionPermissions.userId, userId),
    connectionId: eq(connectionPermissions.connectionId, connectionId),
    organizationId: eq(connectionPermissions.organizationId, organizationId),
  }));

  await db.delete(databaseConnections).where(eq => ({
    id: eq(databaseConnections.id, connectionId),
  }));

  await db.delete(users).where(eq => ({
    id: eq(users.id, userId),
  }));

  await db.delete(organizations).where(eq => ({
    id: eq(organizations.id, organizationId),
  }));
}
