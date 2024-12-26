import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { createClient } from "@redis/client";
import { Database } from "sqlite3";
import { createPool, FieldPacket } from "mysql2/promise";
import type {
  ConnectionConfig,
  DatabaseClient,
  QueryResult,
} from "~/types";

interface ConnectionPool {
  [key: string]: DatabaseClient;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: ConnectionPool = {};

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

  public async createConnection(
    connectionId: string,
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (this.connections[connectionId]) {
      return this.connections[connectionId];
    }

    let client: DatabaseClient;

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
    return client;
  }

  public async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections[connectionId];
    if (connection) {
      await connection.close();
      delete this.connections[connectionId];
    }
  }

  private async createPostgresConnection(
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (!config.host || !config.port || !config.database) {
      throw new Error("Host, port, and database are required for PostgreSQL connections");
    }

    const pool = new Pool({
      host: config.host,
      port: parseInt(config.port),
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    });

    return {
      query: async (sql: string, params?: any[]): Promise<QueryResult> => {
        const start = Date.now();
        const result = await pool.query(sql, params);
        const executionTime = Date.now() - start;

        return {
          fields: result.fields.map((field) => ({
            name: field.name,
            type: field.dataTypeID.toString(),
            dataType: field.dataTypeID.toString(),
          })),
          rows: result.rows as Record<string, any>[],
          rowCount: result.rowCount || 0,
          metrics: {
            executionTimeMs: executionTime,
            bytesProcessed: 0,
            rowsAffected: result.rowCount || 0,
          },
        };
      },
      close: async () => {
        await pool.end();
      },
      testConnection: async () => {
        try {
          await pool.query("SELECT 1");
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  private async createMySQLConnection(
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (!config.host || !config.port || !config.database) {
      throw new Error("Host, port, and database are required for MySQL connections");
    }

    const pool = await createPool({
      host: config.host,
      port: parseInt(config.port),
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    });

    return {
      query: async (sql: string, params?: any[]): Promise<QueryResult> => {
        const start = Date.now();
        const [rows, fields] = await pool.query(sql, params);
        const executionTime = Date.now() - start;

        const resultRows = Array.isArray(rows) 
          ? rows as Record<string, any>[]
          : [rows as Record<string, any>];

        return {
          fields: (fields as FieldPacket[]).map((field) => ({
            name: field.name,
            type: (field.type || 'string').toString(),
            dataType: field.type?.toString() || 'string',
          })),
          rows: resultRows,
          rowCount: resultRows.length,
          metrics: {
            executionTimeMs: executionTime,
            bytesProcessed: 0,
            rowsAffected: resultRows.length,
          },
        };
      },
      close: async () => {
        await pool.end();
      },
      testConnection: async () => {
        try {
          await pool.query("SELECT 1");
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  private async createSQLiteConnection(
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (!config.database) {
      throw new Error("Database path is required for SQLite connections");
    }

    const db = new Database(config.database);

    return {
      query: (sql: string, params?: any[]): Promise<QueryResult> => {
        return new Promise((resolve, reject) => {
          const start = Date.now();
          db.all(sql, params, (error, rows) => {
            if (error) {
              reject(error);
              return;
            }

            const executionTime = Date.now() - start;
            const result: QueryResult = {
              fields: [],
              rows: (rows || []) as Record<string, any>[],
              rowCount: rows ? rows.length : 0,
              metrics: {
                executionTimeMs: executionTime,
                bytesProcessed: 0,
                rowsAffected: rows ? rows.length : 0,
              },
            };
            resolve(result);
          });
        });
      },
      close: async () => {
        return new Promise<void>((resolve, reject) => {
          db.close((error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      },
      testConnection: async () => {
        try {
          await new Promise<void>((resolve, reject) => {
            db.get("SELECT 1", (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          });
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  private async createMongoDBConnection(
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (!config.host || !config.port || !config.database) {
      throw new Error("Host, port, and database are required for MongoDB connections");
    }

    const client = await MongoClient.connect(
      `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
    );

    return {
      query: async (sql: string): Promise<QueryResult> => {
        const start = Date.now();
        const db = client.db(config.database);
        const collection = db.collection("test"); // This should be parameterized
        const result = await collection.find({}).toArray();
        const executionTime = Date.now() - start;

        return {
          fields: [], // MongoDB doesn't have fixed schema
          rows: result.map((row) => ({ ...row, _id: row._id.toString() })) as Record<string, any>[],
          rowCount: result.length,
          metrics: {
            executionTimeMs: executionTime,
            bytesProcessed: 0,
            rowsAffected: result.length,
          },
        };
      },
      close: async () => {
        await client.close();
      },
      testConnection: async () => {
        try {
          await client.db("admin").command({ ping: 1 });
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  private async createRedisConnection(
    config: ConnectionConfig
  ): Promise<DatabaseClient> {
    if (!config.host || !config.port) {
      throw new Error("Host and port are required for Redis connections");
    }

    const client = createClient({
      url: `redis://${config.username}:${config.password}@${config.host}:${config.port}`,
    });

    await client.connect();

    return {
      query: async (command: string): Promise<QueryResult> => {
        const start = Date.now();
        const [cmd, ...args] = command.split(" ");
        const result = await client.sendCommand([cmd, ...args]);
        const executionTime = Date.now() - start;

        const rows = Array.isArray(result)
          ? result.map((item) => ({ value: String(item) }))
          : [{ value: String(result) }];

        return {
          fields: [{
            name: "value",
            type: "string",
            dataType: "string",
          }],
          rows: rows as Record<string, any>[],
          rowCount: rows.length,
          metrics: {
            executionTimeMs: executionTime,
            bytesProcessed: 0,
            rowsAffected: rows.length,
          },
        };
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
    };
  }
}

export const connectionManager = ConnectionManager.getInstance();
