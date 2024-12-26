import { describe, test, expect, beforeEach } from 'vitest';
import { permissionsManager } from '../permissions-manager.server';
import { db } from '../db.server';
import { createTestConnection, createTestOrganization, createTestUser } from './utils';

describe('PermissionsManager', () => {
  const testUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    hashedPassword: 'hashed',
  };

  const testOrg = {
    id: 'test-org-id',
    name: 'Test Org',
  };

  const testConnection = {
    id: 'test-connection-id',
    name: 'Test Connection',
    type: 'POSTGRES',
    config: {
      type: 'POSTGRES',
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'test',
      password: 'test',
    },
  };

  beforeEach(async () => {
    await db.delete(db.connectionPermissions);
    await db.delete(db.organizationMembers);
    await db.delete(db.databaseConnections);
    await db.delete(db.organizations);
    await db.delete(db.users);

    await createTestUser(testUser);
    await createTestOrganization(testOrg);
    await createTestConnection({
      ...testConnection,
      organizationId: testOrg.id,
      createdById: testUser.id,
    });
  });

  describe('hasConnectionAccess', () => {
    test('returns false when user has no access', async () => {
      const hasAccess = await permissionsManager.hasConnectionAccess(
        testUser.id,
        testOrg.id,
        testConnection.id
      );
      expect(hasAccess).toBe(false);
    });

    test('returns true when user has access', async () => {
      await permissionsManager.grantConnectionAccess(
        testUser.id,
        testOrg.id,
        testConnection.id
      );

      const hasAccess = await permissionsManager.hasConnectionAccess(
        testUser.id,
        testOrg.id,
        testConnection.id
      );
      expect(hasAccess).toBe(true);
    });
  });

  describe('isConnectionAdmin', () => {
    test('returns false when user has no access', async () => {
      const isAdmin = await permissionsManager.isConnectionAdmin(
        testUser.id,
        testOrg.id,
        testConnection.id
      );
      expect(isAdmin).toBe(false);
    });

    test('returns false when user has non-admin access', async () => {
      await permissionsManager.grantConnectionAccess(
        testUser.id,
        testOrg.id,
        testConnection.id,
        false
      );

      const isAdmin = await permissionsManager.isConnectionAdmin(
        testUser.id,
        testOrg.id,
        testConnection.id
      );
      expect(isAdmin).toBe(false);
    });

    test('returns true when user has admin access', async () => {
      await permissionsManager.grantConnectionAccess(
        testUser.id,
        testOrg.id,
        testConnection.id,
        true
      );

      const isAdmin = await permissionsManager.isConnectionAdmin(
        testUser.id,
        testOrg.id,
        testConnection.id
      );
      expect(isAdmin).toBe(true);
    });
  });

  describe('validateQuery', () => {
    test('returns true for allowed operations', async () => {
      const result = await permissionsManager.validateQuery(
        'SELECT * FROM users',
        testUser.id,
        testOrg.id
      );
      expect(result.isValid).toBe(true);
    });

    test('returns false for disallowed operations', async () => {
      const result = await permissionsManager.validateQuery(
        'DROP TABLE users',
        testUser.id,
        testOrg.id
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Operation DROP is not allowed');
    });
  });
});
