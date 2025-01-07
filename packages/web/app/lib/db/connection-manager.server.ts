import type { FieldPacket } from "mysql2/promise";
import { createPool } from "mysql2/promise";
import type {
  QueryResult,
  QueryMetrics,
  QueryField,
  DatabaseClient,
  QueryParams,
  DatabaseValue,
} from "../../types";
import { ConnectionConfig } from "./schema";

interface ConnectionPool {
  [key: string]: DatabaseClient;
}

interface ConnectionStats {
  isConnected: boolean;
  activeQueries: number;
  lastUsed?: Date;
  error?: string;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: ConnectionPool = {};
  private stats: Map<string, ConnectionStats> = new Map();

  private constructor() {}

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public async getConnection(connectionId: string): Promise<DatabaseClient> {
    const connection = this.connections[connectionId];
    if (!connection) {
      throw new Error(`No active connection found for ID: ${connectionId}`);
    }
    return connection;
  }

  public async getConnectionStats(connectionId: string): Promise<ConnectionStats> {
    const stats = this.stats.get(connectionId) || {
      isConnected: false,
      activeQueries: 0
    };
    return stats;
  }

  public async createConnection(
    connectionId: string,
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (this.connections[connectionId]) {
      throw new Error(`Connection with ID ${connectionId} already exists`);
    }

    let client: DatabaseClient;

    try {
      switch (config.type) {
        case "POSTGRES":
          client = await this.createPostgresConnection(config);
          break;
        case "MYSQL":
          client = await this.createMySQLConnection(config);
          break;
        case "SQLITE":
          client = await this.createSQLiteConnection(config);
          break;
        case "MONGODB":
          client = await this.createMongoDBConnection(config);
          break;
        case "REDIS":
          client = await this.createRedisConnection(config);
          break;
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }

      this.connections[connectionId] = client;
      this.stats.set(connectionId, {
        isConnected: true,
        activeQueries: 0,
        lastUsed: new Date()
      });

      return client;
    } catch (error) {
      this.stats.set(connectionId, {
        isConnected: false,
        activeQueries: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async resetConnection(connectionId: string): Promise<void> {
    const connection = this.connections[connectionId];
    if (connection) {
      await connection.close();
      delete this.connections[connectionId];
      this.stats.delete(connectionId);
    }
  }

  public async closeConnection(connectionId: string): Promise<void> {
    await this.resetConnection(connectionId);
  }

  public async validateAndExecuteQuery(
    connectionId: string,
    sql: string,
    params?: QueryParams[]
  ): Promise<QueryResult> {
    const connection = await this.getConnection(connectionId);
    const stats = this.stats.get(connectionId);
    if (stats) {
      stats.activeQueries++;
      stats.lastUsed = new Date();
    }

    try {
      return await connection.query(sql, params);
    } finally {
      if (stats) {
        stats.activeQueries--;
      }
    }
  }

  private async createPostgresConnection(config: ConnectionConfig): Promise<DatabaseClient> {
    const { Pool } = await import("pg");
    const pool = new Pool({
      host: config.host || "localhost",
      port: config.port ? Number.parseInt(config.port) : 5432,
      database: config.database || undefined,
      user: config.username || undefined,
      password: config.password || undefined,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined
    });

    return {
      query: async (sql: string, params?: QueryParams[]): Promise<QueryResult> => {
        const client = await pool.connect();
        try {
          const startTime = Date.now();
          const result = await client.query(sql, params);
          const endTime = Date.now();

          const fields: QueryField[] = result.fields.map(field => ({
            name: field.name,
            type: field.dataTypeID.toString(),
            dataType: field.format
          }));

          const metrics: QueryMetrics = {
            executionTimeMs: endTime - startTime,
            bytesProcessed: 0, // Not available in pg
            rowsAffected: result.rowCount || 0
          };

          return {
            columns: [],
            fields,
            rows: result.rows,
            rowCount: result.rowCount || 0,
            metrics,
            executionTime: endTime - startTime
          };
        } finally {
          client.release();
        }
      },
      close: async () => {
        await pool.end();
      },
      testConnection: async () => {
        try {
          const client = await pool.connect();
          client.release();
          return true;
        } catch (error) {
          return false;
        }
      },
      connect: async () => {
        const client = await pool.connect();
        client.release();
      }
    };
  }

  private async createMySQLConnection(config: ConnectionConfig): Promise<DatabaseClient> {
    const pool = createPool({
      host: config.host || "localhost",
      port: config.port ? Number.parseInt(config.port) : 3306,
      database: config.database || undefined,
      user: config.username || undefined,
      password: config.password || undefined,
      ssl: config.ssl ? {} : undefined
    });

    return {
      query: async (sql: string, params?: QueryParams[]): Promise<QueryResult> => {
        const startTime = Date.now();
        const [rows, fields] = await pool.query(sql, params);
        const endTime = Date.now();

        const queryFields: QueryField[] = (fields as FieldPacket[]).map(field => ({
          name: field.name,
          type: field?.type?.toString() || "",
          dataType: field?.type?.toString() || ""
        }));

        const metrics: QueryMetrics = {
          executionTimeMs: endTime - startTime,
          bytesProcessed: 0, // Not available in MySQL
          rowsAffected: Array.isArray(rows) ? rows.length : 0
        };

        return {
          columns: [],
          fields: queryFields,
          rows: Array.isArray(rows) ? rows as Record<string, DatabaseValue>[] : [rows] as unknown as Record<string, DatabaseValue>[],
          rowCount: Array.isArray(rows) ? rows.length : 1,
          metrics,
          executionTime: endTime - startTime
        };
      },
      close: async () => {
        await pool.end();
      },
      testConnection: async () => {
        try {
          await pool.getConnection();
          return true;
        } catch (error) {
          return false;
        }
      },
      connect: async () => {
        const connection = await pool.getConnection();
        connection.release();
      }
    };
  }

  private async createSQLiteConnection(config: ConnectionConfig): Promise<DatabaseClient> {
    const { Database } = await import("sqlite3");
    const db = new Database(config.filepath || ":memory:");

    return {
      query: async (sql: string, params?: QueryParams[]): Promise<QueryResult> => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          db.all(sql, params, (error, rows) => {
            if (error) {
              reject(error);
              return;
            }

            const endTime = Date.now();
            const metrics: QueryMetrics = {
              executionTimeMs: endTime - startTime,
              bytesProcessed: 0, // Not available in SQLite
              rowsAffected: rows?.length || 0
            };

            resolve({
              columns: [],
              fields: [], // SQLite doesn't provide field metadata
              rows: (rows || []) as Record<string, DatabaseValue>[],
              rowCount: rows?.length || 0,
              metrics,
              executionTime: endTime - startTime
            });
          });
        });
      },
      close: async () => {
        return new Promise((resolve, reject) => {
          db.close(error => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      },
      testConnection: async () => {
        return new Promise((resolve) => {
          db.all("SELECT 1", [], (error) => {
            resolve(!error);
          });
        });
      },
      connect: async () => {
        return new Promise((resolve, reject) => {
          db.all("SELECT 1", [], (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    };
  }

  private async createMongoDBConnection(config: ConnectionConfig): Promise<DatabaseClient> {
    const { MongoClient } = await import("mongodb");
    const url = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    const client = await MongoClient.connect(url);

    return {
      query: async (sql: string): Promise<QueryResult> => {
        throw new Error("MongoDB query not implemented");
      },
      close: async () => {
        await client.close();
      },
      testConnection: async () => {
        try {
          await client.db().command({ ping: 1 });
          return true;
        } catch (error) {
          return false;
        }
      },
      connect: async () => {
        await client.db().command({ ping: 1 });
      }
    };
  }

  private async createRedisConnection(config: ConnectionConfig): Promise<DatabaseClient> {
    const { createClient } = await import("redis");
    const client = createClient({
      url: `redis://${config.username}:${config.password}@${config.host}:${config.port}`
    });

    await client.connect();

    return {
      query: async (sql: string): Promise<QueryResult> => {
        throw new Error("Redis query not implemented");
      },
      close: async () => {
        await client.quit();
      },
      testConnection: async () => {
        try {
          await client.ping();
          return true;
        } catch (error) {
          return false;
        }
      },
      connect: async () => {
        await client.ping();
      }
    };
  }
}

export const connectionManager = ConnectionManager.getInstance();
