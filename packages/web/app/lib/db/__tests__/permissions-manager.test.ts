import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { permissionsManager } from '../permissions-manager.server';
import {
  createTestUser,
  createTestConnection,
  setTestPermissions,
  cleanupTestData,
  type TestUser,
  type TestConnection,
} from './utils';

describe('PermissionsManager', () => {
  let testUser: TestUser;
  let testConnection: TestConnection;

  beforeEach(async () => {
    testUser = await createTestUser();
    testConnection = await createTestConnection();
  });

  afterEach(async () => {
    await cleanupTestData(testUser.id, testConnection.id, testUser.organizationId);
  });

  describe('checkConnectionAccess', () => {
    it('should return false when no permissions exist', async () => {
      const hasAccess = await permissionsManager.checkConnectionAccess(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(hasAccess).toBe(false);
    });

    it('should return true when user has connect permission', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
      });

      const hasAccess = await permissionsManager.checkConnectionAccess(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(hasAccess).toBe(true);
    });

    it('should return false when connect permission is false', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: false,
      });

      const hasAccess = await permissionsManager.checkConnectionAccess(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(hasAccess).toBe(false);
    });
  });

  describe('validateQuery', () => {
    it('should validate allowed operations', async () => {
      const restrictions = {
        allowedOperations: ['SELECT'] as const,
      };

      const validResult = await permissionsManager.validateQuery(
        'SELECT * FROM users',
        restrictions
      );
      expect(validResult.isValid).toBe(true);

      const invalidResult = await permissionsManager.validateQuery(
        'DELETE FROM users',
        restrictions
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Operation DELETE is not allowed');
    });

    it('should validate allowed tables', async () => {
      const restrictions = {
        allowedTables: ['users', 'posts'],
      };

      const validResult = await permissionsManager.validateQuery(
        'SELECT * FROM users JOIN posts ON users.id = posts.user_id',
        restrictions
      );
      expect(validResult.isValid).toBe(true);

      const invalidResult = await permissionsManager.validateQuery(
        'SELECT * FROM users JOIN comments ON users.id = comments.user_id',
        restrictions
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Access to table comments is not allowed');
    });

    it('should validate blocked tables', async () => {
      const restrictions = {
        blockedTables: ['sensitive_data', 'user_secrets'],
      };

      const validResult = await permissionsManager.validateQuery(
        'SELECT * FROM users',
        restrictions
      );
      expect(validResult.isValid).toBe(true);

      const invalidResult = await permissionsManager.validateQuery(
        'SELECT * FROM sensitive_data',
        restrictions
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Access to table sensitive_data is blocked');
    });

    it('should validate allowed schemas', async () => {
      const restrictions = {
        allowedSchemas: ['public', 'app'],
      };

      const validResult = await permissionsManager.validateQuery(
        'SELECT * FROM public.users JOIN app.posts ON users.id = posts.user_id',
        restrictions
      );
      expect(validResult.isValid).toBe(true);

      const invalidResult = await permissionsManager.validateQuery(
        'SELECT * FROM private.sensitive_data',
        restrictions
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Access to schema private is not allowed');
    });
  });

  describe('getQueryRestrictions', () => {
    it('should return null when no restrictions exist', async () => {
      const restrictions = await permissionsManager.getQueryRestrictions(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(restrictions).toBeNull();
    });

    it('should return configured restrictions', async () => {
      const testRestrictions = {
        maxRowsPerQuery: 1000,
        allowedSchemas: ['public'],
        allowedTables: ['users', 'posts'],
        allowedOperations: ['SELECT', 'INSERT'] as const,
      };

      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        queryRestrictions: testRestrictions,
      });

      const restrictions = await permissionsManager.getQueryRestrictions(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(restrictions).toEqual(testRestrictions);
    });
  });
});
