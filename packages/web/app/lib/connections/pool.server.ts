import pg from "pg";
import { db } from "../db/db.server";
import { databaseConnections } from "../db/schema";
import { eq } from "drizzle-orm";
import type { DatabaseConnection } from "../db/schema/connections";

interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export class ConnectionPool {
  private pools: Map<string, pg.Pool> = new Map();

  async getPool(connection: DatabaseConnection): Promise<pg.Pool> {
    if (this.pools.has(connection.id)) {
      return this.pools.get(connection.id)!;
    }

    if (connection.type !== 'POSTGRES') {
      throw new Error('Only PostgreSQL connections are supported');
    }

    const config: PoolConfig = {
      host: connection.host || '',
      port: connection.port ? Number.parseInt(connection.port) : 5432,
      database: connection.database || '',
      user: connection.username || '',
      password: connection.password || '',
      ssl: connection.ssl || false,
    };

    const pool = new pg.Pool(config);

    // Test the connection
    try {
      const client = await pool.connect();
      await client.release();
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.pools.set(connection.id, pool);

    // Update last used timestamp
    await db
      .update(databaseConnections)
      .set({ 
        lastUsedAt: new Date(),
      })
      .where(eq(databaseConnections.id, connection.id));

    return pool;
  }

  async releasePool(connectionId: string): Promise<void> {
    const pool = this.pools.get(connectionId);
    if (pool) {
      await pool.end();
      this.pools.delete(connectionId);
    }
  }

  async releaseAllPools(): Promise<void> {
    for (const [connectionId, pool] of this.pools.entries()) {
      await pool.end();
      this.pools.delete(connectionId);
    }
  }
}

export const connectionPool = new ConnectionPool();

