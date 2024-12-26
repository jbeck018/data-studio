import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { db } from '../db.server';
import { connectionManager } from '../connection-manager.server';
import { type Connection, type PostgresConfig } from '~/types';
import { createTestConnection, createTestOrganization, createTestUser } from './utils';
import { sql } from 'drizzle-orm';

describe('ConnectionManager', () => {
  let testUser: { id: string };
  let testOrg: { id: string };
  let testConnection: Connection;

  beforeEach(async () => {
    await db.execute(sql`BEGIN`);
    testUser = await createTestUser();
    testOrg = await createTestOrganization(testUser.id);
    testConnection = await createTestConnection({
      organizationId: testOrg.id,
      createdById: testUser.id,
      config: {
        type: 'POSTGRES',
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test',
      } as PostgresConfig,
    });
  });

  afterEach(async () => {
    await db.execute(sql`ROLLBACK`);
  });

  it('should get connection', async () => {
    const connection = await connectionManager.getConnection(testConnection.id, testUser.id);
    expect(connection).toBeDefined();
    expect(connection?.connectionId).toBe(testConnection.id);
  });

  it('should execute query', async () => {
    const connection = await connectionManager.getConnection(testConnection.id, testUser.id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const result = await connection.query('SELECT 1 as num');
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].num).toBe(1);
  });

  it('should handle query errors', async () => {
    const connection = await connectionManager.getConnection(testConnection.id, testUser.id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const result = await connection.query('SELECT invalid_column');
    expect(result.error).toBeDefined();
  });

  it('should disconnect and reconnect', async () => {
    const connection = await connectionManager.getConnection(testConnection.id, testUser.id);
    expect(connection).toBeDefined();

    await connectionManager.disconnect(testConnection.id);
    const closedConnection = await connectionManager.getConnection(testConnection.id, testUser.id);
    expect(closedConnection).toBeNull();
  });
});
