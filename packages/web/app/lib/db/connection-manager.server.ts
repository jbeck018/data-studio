import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { Pool } from 'pg';

interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, postgres.Sql<any>>;

  private constructor() {
    this.connections = new Map();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public async getConnection(config: ConnectionConfig): Promise<postgres.Sql<any>> {
    const connectionString = this.buildConnectionString(config);
    
    if (!this.connections.has(connectionString)) {
      try {
        const sql = postgres(connectionString, {
          ssl: config.ssl,
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10
        });
        
        this.connections.set(connectionString, sql);
      } catch (error) {
        console.error('Failed to establish database connection:', error);
        throw error;
      }
    }

    return this.connections.get(connectionString)!;
  }

  public getDrizzle(sql: postgres.Sql<any>) {
    return drizzle(sql, { schema });
  }

  private buildConnectionString(config: ConnectionConfig): string {
    const { host, port, database, user, password, ssl } = config;
    let connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
    if (ssl) {
      connectionString += '?sslmode=require';
    }
    return connectionString;
  }

  public async closeConnection(config: ConnectionConfig): Promise<void> {
    const connectionString = this.buildConnectionString(config);
    const connection = this.connections.get(connectionString);
    
    if (connection) {
      await connection.end();
      this.connections.delete(connectionString);
    }
  }

  public async closeAllConnections(): Promise<void> {
    for (const connection of this.connections.values()) {
      await connection.end();
    }
    this.connections.clear();
  }
}

export const connectionManager = ConnectionManager.getInstance();
