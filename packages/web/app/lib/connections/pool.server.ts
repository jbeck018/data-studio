import { db } from "../../lib/db/db.server";
import { databaseConnections } from "../db/schema/connections";
import type { StandardConnectionConfig } from "../db/schema/connections";
import type { ConnectionConfig, DatabaseConnection } from "~/types";
import { Pool } from 'pg';

export type DatabaseConnectionType = "POSTGRES" | "MYSQL";

export interface DatabaseConnectionData {
  name: string;
  type: DatabaseConnectionType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  organizationId: string;
  createdById: string;
}

export class ConnectionPool {
  private connections: Map<string, Pool>;

  constructor() {
    this.connections = new Map();
  }

  async getConnection(connection: DatabaseConnection): Promise<Pool> {
    if (this.connections.has(connection.id)) {
      return this.connections.get(connection.id)!;
    }

    const config: any = {
      host: connection.host,
      port: parseInt(connection.port),
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl: connection.ssl === "true"
    };

    const pool = new Pool(config);
    this.connections.set(connection.id, pool);
    return pool;
  }

  async releaseConnection(connectionId: string): Promise<void> {
    const pool = this.connections.get(connectionId);
    if (pool) {
      await pool.end();
      this.connections.delete(connectionId);
    }
  }
}

export async function createDatabaseConnection(data: DatabaseConnectionData) {
  // TODO: Add validation to check if connection works before saving
  const [connection] = await db.insert(databaseConnections)
    .values({
      name: data.name,
      type: data.type,
      config: {
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        ssl: data.ssl
      } satisfies StandardConnectionConfig,
      organizationId: data.organizationId,
      createdById: data.createdById,
    })
    .returning();

  return connection;
}
