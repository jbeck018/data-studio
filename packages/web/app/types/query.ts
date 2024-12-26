export type DatabaseType = 'POSTGRES' | 'MYSQL' | 'SQLITE' | 'MSSQL' | 'ORACLE' | 'MONGODB' | 'REDIS';

export interface BaseConnectionConfig {
  type: DatabaseType;
  name: string;
  host: string;
  port?: number;
  username?: string;
  password?: string;
  ssl?: boolean | { [key: string]: any };
}

export interface StandardConnectionConfig extends BaseConnectionConfig {
  type: 'POSTGRES' | 'MYSQL' | 'MSSQL' | 'ORACLE';
  database: string;
}

export interface SQLiteConnectionConfig extends BaseConnectionConfig {
  type: 'SQLITE';
  filepath: string;
}

export interface MongoDBConnectionConfig extends BaseConnectionConfig {
  type: 'MONGODB';
  database: string;
  authSource: string;
  replicaSet?: string;
}

export interface RedisConnectionConfig extends BaseConnectionConfig {
  type: 'REDIS';
}

export type ConnectionConfig = StandardConnectionConfig | SQLiteConnectionConfig | MongoDBConnectionConfig | RedisConnectionConfig;

export interface QueryField {
  name: string;
  dataType: string;
  tableId?: string;
  nullable?: boolean;
  dataTypeId?: string;
}

export interface QueryMetrics {
  executionTime: number;
  rowCount: number;
  error?: string;
  warning?: string;
  notice?: string;
}

export interface QueryResult {
  fields: QueryField[];
  rows: any[];
  rowCount: number;
  metrics: QueryMetrics;
  columns?: Column[];
}

export interface Connection {
  id: string;
  type: DatabaseType;
  name: string;
  config: ConnectionConfig;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface TableSchema {
  name: string;
  tableName: string;
  connectionId: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKeySchema[];
  rowCount: number;
  sizeInBytes: number;
}

export interface Column {
  columnName: string;
  name: string;
  dataType: string;
  type: string;
  isNullable: boolean;
  nullable: boolean;
  defaultValue: string | null;
}

export interface ForeignKeySchema {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface QueryOptions {
  sql: string;
  connectionId?: string;
  userId?: string;
  config?: any;
}

export interface CrossDatabaseQueryOptions extends QueryOptions {
  targetDatabase?: string;
}

export interface QueryHistoryEntry {
  id: string;
  organizationId: string;
  connectionId: string;
  userId: string;
  query: string;
  status: 'success' | 'error';
  executionTime: number;
  rowCount: number;
  error: string | null;
  createdAt: Date;
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState {
  status: QueryStatus;
  result: QueryResult | null;
  error: string | null;
  isLoading: boolean;
}

export enum QueryErrorCode {
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_TABLE = 'INVALID_TABLE',
  INVALID_COLUMN = 'INVALID_COLUMN',
  INVALID_LIMIT = 'INVALID_LIMIT',
  INVALID_OFFSET = 'INVALID_OFFSET',
  UNSAFE_QUERY = 'UNSAFE_QUERY',
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class QueryError extends Error {
  code: QueryErrorCode;
  metrics?: QueryMetrics;
  
  constructor(code: QueryErrorCode, message: string, metrics?: QueryMetrics) {
    super(message);
    this.code = code;
    this.metrics = metrics;
    this.name = 'QueryError';
  }
}
