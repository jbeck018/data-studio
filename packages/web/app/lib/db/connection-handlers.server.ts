import { Client as PgClient } from 'pg';
import { createConnection as createMySQLConnection, Connection } from 'mysql2/promise';
import { MongoClient, Db } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import { QueryError, QueryErrorCode, QueryResult, QueryField, QueryMetrics, DatabaseType } from '~/types/query';

export interface ConnectionConfig {
  type: DatabaseType;
  host: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean | { [key: string]: any };
}

export abstract class BaseConnection {
  protected readonly id: string;
  protected readonly organizationId: string;
  protected readonly type: DatabaseType;
  protected readonly config: ConnectionConfig;

  constructor(id: string, organizationId: string, config: ConnectionConfig) {
    this.id = id;
    this.organizationId = organizationId;
    this.config = config;
    this.type = config.type;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query(sql: string, params?: any[]): Promise<QueryResult>;
  abstract testConnection(): Promise<boolean>;

  protected createQueryMetrics(startTime: number): QueryMetrics {
    const executionTime = Date.now() - startTime;
    return {
      executionTime,
      rowCount: 0,
      error: undefined,
      warning: undefined,
      notice: undefined,
    };
  }

  protected createQueryField(name: string, dataType: string, tableId?: string): QueryField {
    return {
      name,
      dataType,
      tableId,
      nullable: true,
    };
  }

  protected handleConnectionError(error: Error): never {
    throw new QueryError(QueryErrorCode.CONNECTION_ERROR, error.message);
  }

  protected handleUnsupportedType(): never {
    throw new QueryError(QueryErrorCode.UNSUPPORTED_TYPE, `Unsupported database type: ${this.type}`);
  }
}

export class PostgresConnection extends BaseConnection {
  protected client!: PgClient;

  async connect(): Promise<void> {
    try {
      this.client = new PgClient({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
      });
      await this.client.connect();
    } catch (error) {
      if (error instanceof Error) {
        this.handleConnectionError(error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    const startTime = Date.now();
    try {
      const result = await this.client.query(sql, params);
      return {
        fields: result.fields.map(field => this.createQueryField(
          field.name,
          field.dataTypeID.toString(),
          field.tableID?.toString()
        )),
        rows: result.rows,
        rowCount: result.rowCount ?? 0,
        metrics: this.createQueryMetrics(startTime),
      };
    } catch (error) {
      if (error instanceof Error) {
        const pgError = error as any;
        if (pgError.code === '42P01') {
          throw new QueryError(QueryErrorCode.INVALID_TABLE, 'Table does not exist');
        } else if (pgError.code === '42703') {
          throw new QueryError(QueryErrorCode.INVALID_COLUMN, 'Column does not exist');
        } else if (pgError.code === '42601') {
          throw new QueryError(QueryErrorCode.SYNTAX_ERROR, pgError.message);
        } else if (pgError.code === '42501') {
          throw new QueryError(QueryErrorCode.PERMISSION_DENIED, 'Permission denied');
        }
        throw new QueryError(QueryErrorCode.EXECUTION_ERROR, pgError.message);
      }
      throw error;
    }
  }
}

export class MySQLConnection extends BaseConnection {
  protected client!: Connection;

  async connect(): Promise<void> {
    try {
      const config = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
      };
      this.client = await createMySQLConnection(config);
    } catch (error) {
      if (error instanceof Error) {
        this.handleConnectionError(error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.execute('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    const startTime = Date.now();
    try {
      const [rows, fields] = await this.client.execute(sql, params);
      const rowArray = Array.isArray(rows) ? rows : [rows];

      return {
        fields: fields.map(field => this.createQueryField(field.name, field.type?.toString() || 'unknown', field.table)),
        rows: rowArray,
        rowCount: rowArray.length,
        metrics: this.createQueryMetrics(startTime),
      };
    } catch (error) {
      if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
          throw new QueryError(QueryErrorCode.INVALID_TABLE, 'Table does not exist');
        } else if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
          throw new QueryError(QueryErrorCode.INVALID_COLUMN, 'Column does not exist');
        } else if (mysqlError.code === 'ER_PARSE_ERROR') {
          throw new QueryError(QueryErrorCode.SYNTAX_ERROR, mysqlError.message);
        } else if (mysqlError.code === 'ER_ACCESS_DENIED_ERROR') {
          throw new QueryError(QueryErrorCode.PERMISSION_DENIED, 'Permission denied');
        }
        throw new QueryError(QueryErrorCode.EXECUTION_ERROR, mysqlError.message);
      }
      throw error;
    }
  }
}

export class MongoDBConnection extends BaseConnection {
  protected client!: MongoClient;
  protected db!: Db;

  async connect(): Promise<void> {
    try {
      this.client = await MongoClient.connect(
        `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`
      );
      this.db = this.client.db(this.config.database);
    } catch (error) {
      if (error instanceof Error) {
        this.handleConnectionError(error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async query(query: string): Promise<QueryResult> {
    const startTime = Date.now();
    try {
      const collection = this.db.collection('default');
      const result = await collection.find(JSON.parse(query)).toArray();
      return {
        fields: [this.createQueryField('_id', 'objectId')],
        rows: result,
        rowCount: result.length,
        metrics: this.createQueryMetrics(startTime),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(QueryErrorCode.EXECUTION_ERROR, error.message);
      }
      throw error;
    }
  }
}

export class RedisConnection extends BaseConnection {
  protected client!: RedisClientType;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: `redis://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`,
      });
      await this.client.connect();
    } catch (error) {
      if (error instanceof Error) {
        this.handleConnectionError(error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async query(command: string): Promise<QueryResult> {
    const startTime = Date.now();
    try {
      const [cmd, ...args] = command.split(' ');
      const result = await (this.client as any)[cmd.toLowerCase()](...args);
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
      
      return {
        fields: [this.createQueryField('result', 'string')],
        rows: [[resultStr]],
        rowCount: 1,
        metrics: this.createQueryMetrics(startTime),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(QueryErrorCode.EXECUTION_ERROR, error.message);
      }
      throw error;
    }
  }
}

export function createConnection(
  id: string,
  organizationId: string,
  config: ConnectionConfig
): BaseConnection {
  switch (config.type) {
    case 'POSTGRES':
      return new PostgresConnection(id, organizationId, config);
    case 'MYSQL':
      return new MySQLConnection(id, organizationId, config);
    case 'MONGODB':
      return new MongoDBConnection(id, organizationId, config);
    case 'REDIS':
      return new RedisConnection(id, organizationId, config);
    default:
      throw new QueryError(QueryErrorCode.UNSUPPORTED_TYPE, `Unsupported database type: ${config.type}`);
  }
}
