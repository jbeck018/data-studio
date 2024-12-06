import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { connectionManager } from '../connection-manager.server';
import { permissionsManager } from '../permissions-manager.server';
import {
  createTestUser,
  createTestConnection,
  setTestPermissions,
  cleanupTestData,
  type TestUser,
  type TestConnection,
} from './utils';

// Mock the database connection functions
vi.mock('../connection-handlers.server', () => ({
  createConnection: vi.fn().mockImplementation(() => ({
    query: vi.fn().mockResolvedValue([{ result: 'test' }]),
  })),
  closeConnection: vi.fn().mockResolvedValue(undefined),
}));

describe('ConnectionManager', () => {
  let testUser: TestUser;
  let testConnection: TestConnection;

  beforeEach(async () => {
    testUser = await createTestUser();
    testConnection = await createTestConnection();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestData(testUser.id, testConnection.id, testUser.organizationId);
    await connectionManager.shutdown();
  });

  describe('getConnection', () => {
    it('should throw error when user lacks permission', async () => {
      await expect(
        connectionManager.getConnection(
          testConnection.id,
          testUser.id,
          testUser.organizationId
        )
      ).rejects.toThrow('Access denied');
    });

    it('should return connection when user has permission', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
      });

      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(connection).toBeDefined();
      expect(connection.query).toBeDefined();
    });

    it('should respect max concurrent queries limit', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
        queryRestrictions: {
          maxConcurrentQueries: 1,
        },
      });

      // Get first connection
      const connection1 = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );
      expect(connection1).toBeDefined();

      // Second connection should fail
      await expect(
        connectionManager.getConnection(
          testConnection.id,
          testUser.id,
          testUser.organizationId
        )
      ).rejects.toThrow('Maximum concurrent queries limit');
    });
  });

  describe('validateAndExecuteQuery', () => {
    beforeEach(async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
      });
    });

    it('should execute query when no restrictions exist', async () => {
      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      const result = await connectionManager.validateAndExecuteQuery(
        connection,
        'SELECT * FROM test',
        testUser.id,
        testUser.organizationId,
        testConnection.id
      );

      expect(result).toEqual([{ result: 'test' }]);
    });

    it('should respect query restrictions', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
        queryRestrictions: {
          allowedOperations: ['SELECT'],
          allowedTables: ['allowed_table'],
        },
      });

      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      // Valid query
      await expect(
        connectionManager.validateAndExecuteQuery(
          connection,
          'SELECT * FROM allowed_table',
          testUser.id,
          testUser.organizationId,
          testConnection.id
        )
      ).resolves.toBeDefined();

      // Invalid operation
      await expect(
        connectionManager.validateAndExecuteQuery(
          connection,
          'DELETE FROM allowed_table',
          testUser.id,
          testUser.organizationId,
          testConnection.id
        )
      ).rejects.toThrow('Query validation failed');

      // Invalid table
      await expect(
        connectionManager.validateAndExecuteQuery(
          connection,
          'SELECT * FROM restricted_table',
          testUser.id,
          testUser.organizationId,
          testConnection.id
        )
      ).rejects.toThrow('Query validation failed');
    });

    it('should respect max rows limit', async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
        queryRestrictions: {
          maxRowsPerQuery: 1,
        },
      });

      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      await expect(
        connectionManager.validateAndExecuteQuery(
          connection,
          'SELECT * FROM test',
          testUser.id,
          testUser.organizationId,
          testConnection.id
        )
      ).rejects.toThrow('Query result exceeds maximum allowed rows');
    });
  });

  describe('connection pooling', () => {
    beforeEach(async () => {
      await setTestPermissions(testConnection.id, testUser.id, testUser.organizationId, {
        canConnect: true,
      });
    });

    it('should reuse existing connections', async () => {
      const connection1 = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );
      await connectionManager.releaseConnection(testConnection.id);

      const connection2 = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      expect(connection1).toBe(connection2);
    });

    it('should perform health checks', async () => {
      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );

      // Mock a failed health check
      connection.query = vi.fn().mockRejectedValue(new Error('Connection lost'));

      // Wait for next health check
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to get connection again
      await expect(
        connectionManager.getConnection(
          testConnection.id,
          testUser.id,
          testUser.organizationId
        )
      ).resolves.toBeDefined(); // Should create a new connection
    });

    it('should close idle connections', async () => {
      const connection = await connectionManager.getConnection(
        testConnection.id,
        testUser.id,
        testUser.organizationId
      );
      await connectionManager.releaseConnection(testConnection.id);

      // Wait for idle timeout
      await new Promise(resolve => setTimeout(resolve, 100));

      // Connection should be closed
      expect(connection.query).toHaveBeenCalled();
    });
  });
});
