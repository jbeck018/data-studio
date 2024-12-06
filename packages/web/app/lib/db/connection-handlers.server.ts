import { Client } from 'pg';
import { createConnection as createMySQLConnection } from 'mysql2/promise';
import { Database } from 'sqlite3';
import { Connection as MSSQLConnection, Request as MSSQLRequest } from 'tedious';
import { MongoClient } from 'mongodb';
import { createClient as createRedisClient } from 'redis';
import type { DatabaseConnection, ConnectionConfig } from './schema/connections';

export interface BaseConnection {
  query(sql: string): Promise<any>;
  end(): Promise<void>;
}

class PostgresConnection extends Client implements BaseConnection {
  async query(sql: string) {
    return super.query(sql);
  }

  async end() {
    return super.end();
  }
}

class MySQLConnection implements BaseConnection {
  private connection;

  constructor(connection: any) {
    this.connection = connection;
  }

  async query(sql: string) {
    const [rows] = await this.connection.execute(sql);
    return rows;
  }

  async end() {
    return this.connection.end();
  }
}

class SQLiteConnection implements BaseConnection {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  query(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async end(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

class MSSQLConnectionWrapper implements BaseConnection {
  private connection: MSSQLConnection;

  constructor(connection: MSSQLConnection) {
    this.connection = connection;
  }

  async query(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new MSSQLRequest(sql, (err, rowCount, rows) => {
        if (err) reject(err);
        else resolve({ rowCount, rows });
      });
      this.connection.execSql(request);
    });
  }

  async end(): Promise<void> {
    return new Promise((resolve) => {
      this.connection.close();
      resolve();
    });
  }
}

class MongoDBConnection implements BaseConnection {
  private client: MongoClient;
  private db: any;

  constructor(client: MongoClient, dbName: string) {
    this.client = client;
    this.db = client.db(dbName);
  }

  async query(query: string): Promise<any> {
    try {
      const result = await eval(`this.db.${query}`);
      return result;
    } catch (error) {
      throw new Error(`MongoDB query error: ${error}`);
    }
  }

  async end(): Promise<void> {
    await this.client.close();
  }
}

class RedisConnection implements BaseConnection {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async query(command: string): Promise<any> {
    try {
      const [cmd, ...args] = command.split(' ');
      return await this.client.sendCommand([cmd.toUpperCase(), ...args]);
    } catch (error) {
      throw new Error(`Redis command error: ${error}`);
    }
  }

  async end(): Promise<void> {
    await this.client.quit();
  }
}

export async function createConnection(config: ConnectionConfig): Promise<BaseConnection> {
  switch (config.type) {
    case 'POSTGRES': {
      const connection = new PostgresConnection(config);
      await connection.connect();
      return connection;
    }
    case 'MYSQL': {
      const connection = await createMySQLConnection(config);
      return new MySQLConnection(connection);
    }
    case 'SQLITE': {
      return new Promise((resolve, reject) => {
        const db = new Database(config.filepath, (err) => {
          if (err) reject(err);
          else resolve(new SQLiteConnection(db));
        });
      });
    }
    case 'MSSQL': {
      return new Promise((resolve, reject) => {
        const connection = new MSSQLConnection(config);
        connection.on('connect', (err) => {
          if (err) reject(err);
          else resolve(new MSSQLConnectionWrapper(connection));
        });
        connection.connect();
      });
    }
    case 'MONGODB': {
      const { host, port, database, username, password, authSource } = config;
      const url = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
      const client = new MongoClient(url);
      await client.connect();
      return new MongoDBConnection(client, database);
    }
    case 'REDIS': {
      const { host, port, password } = config;
      const client = createRedisClient({
        url: `redis://${password ? `:${password}@` : ''}${host}:${port}`,
      });
      await client.connect();
      return new RedisConnection(client);
    }
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

export interface ConnectionConfig {
  type: string;
  config: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    filepath?: string;
    url?: string;
    authSource?: string;
    replicaSet?: string;
    [key: string]: any;
  };
}
