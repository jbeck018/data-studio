import pkg from 'pg';
const { Pool } = pkg;
type PoolConfig = pkg.PoolConfig;

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { databaseConnections } from './schema';
import { db } from './db.server';

interface ConnectionPool {
  pool: Pool;
  lastUsed: number;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private pools: Map<string, ConnectionPool> = new Map();
  private readonly maxIdleTime = 5 * 60 * 1000; // 5 minutes
  private readonly cleanupInterval = 60 * 1000; // 1 minute

  private constructor() {
    this.startCleanupInterval();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupIdlePools();
    }, this.cleanupInterval);
  }

  private cleanupIdlePools() {
    const now = Date.now();
    for (const [key, { pool, lastUsed }] of this.pools.entries()) {
      if (now - lastUsed > this.maxIdleTime) {
        pool.end();
        this.pools.delete(key);
      }
    }
  }

  private getPoolKey(config: PoolConfig): string {
    const configString = JSON.stringify(config);
    return createHash('sha256').update(configString).digest('hex');
  }

  private decryptCredentials(encryptedCredentials: any): PoolConfig {
    // TODO: Implement proper decryption
    return encryptedCredentials as PoolConfig;
  }

  async getConnection(connectionId: string): Promise<Pool> {
    // Get connection details from the system database
    const connection = await db.query.databaseConnections.findFirst({
      where: eq(databaseConnections.id, connectionId),
    });

    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    if (!connection.isActive) {
      throw new Error(`Connection is not active: ${connectionId}`);
    }

    // Decrypt credentials
    const config = this.decryptCredentials(connection.credentials);
    const poolKey = this.getPoolKey(config);

    // Check if we have an existing pool
    const existingPool = this.pools.get(poolKey);
    if (existingPool) {
      existingPool.lastUsed = Date.now();
      return existingPool.pool;
    }

    // Create a new pool
    const pool = new Pool(config);

    // Test the connection
    try {
      const client = await pool.connect();
      client.release();
    } catch (error) {
      pool.end();
      throw new Error(`Failed to connect to database: ${error.message}`);
    }

    // Store the pool
    this.pools.set(poolKey, {
      pool,
      lastUsed: Date.now(),
    });

    // Update last connected timestamp
    await db
      .update(databaseConnections)
      .set({ lastConnectedAt: new Date() })
      .where(eq(databaseConnections.id, connectionId));

    return pool;
  }

  async closeConnection(connectionId: string): Promise<void> {
    const connection = await db.query.databaseConnections.findFirst({
      where: eq(databaseConnections.id, connectionId),
    });

    if (!connection) {
      return;
    }

    const config = this.decryptCredentials(connection.credentials);
    const poolKey = this.getPoolKey(config);
    const existingPool = this.pools.get(poolKey);

    if (existingPool) {
      await existingPool.pool.end();
      this.pools.delete(poolKey);
    }
  }

  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map(({ pool }) => pool.end());
    await Promise.all(closePromises);
    this.pools.clear();
  }
}
