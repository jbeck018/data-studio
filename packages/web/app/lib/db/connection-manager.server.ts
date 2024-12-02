import type { Pool } from 'pg';
import pg from 'pg';
const { Pool: PgPool } = pg;

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, Pool>;

  private constructor() {
    this.connections = new Map();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public async getConnection(config: ConnectionConfig): Promise<Pool> {
    const connectionString = this.buildConnectionString(config);
    
    if (!this.connections.has(connectionString)) {
      try {
        const pool = new PgPool({
          connectionString,
          ssl: config.ssl,
          max: 10,
          idleTimeoutMillis: 20000,
          connectionTimeoutMillis: 10000
        });
        
        this.connections.set(connectionString, pool);
      } catch (error) {
        console.error('Failed to establish database connection:', error);
        throw error;
      }
    }

    return this.connections.get(connectionString)!;
  }

  private buildConnectionString(config: ConnectionConfig): string {
    const { host, port, database, user, password, ssl } = config;
    const sslParam = ssl ? '?sslmode=require' : '';
    return `postgresql://${user}:${password}@${host}:${port}/${database}${sslParam}`;
  }

  public async closeAll(): Promise<void> {
    for (const pool of this.connections.values()) {
      await pool.end();
    }
    this.connections.clear();
  }
}

export const connectionManager = ConnectionManager.getInstance();
