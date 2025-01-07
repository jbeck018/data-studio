import type { DatabaseConnection } from '~/lib/db/schema/connections';
import { OrganizationMembership, Role } from './lib/db/schema';
import { Organization, User } from './lib/db/schema';

// Database value type
export type DatabaseValue = string | number | boolean | null | Record<string, unknown>;

// Query parameters type
export type QueryParams = string | number | boolean | null | undefined;

// Column schema
export interface ColumnSchema {
  columnName: string;
  name: string;
  type: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  nullable: boolean;
}

// Foreign key definition
export interface ForeignKeyDefinition {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

// Table schema
export interface TableSchema {
  tableName: string;
  name: string;
  connectionId: string;
  columns: ColumnSchema[];
  primaryKeys: string[] | null;
  foreignKeys: ForeignKeyDefinition[];
  rowCount: number;
  sizeInBytes: number;
}

// Query field
export interface QueryField {
  name: string;
  type: string;
  dataType: string;
}

// Query metrics
export interface QueryMetrics {
  executionTimeMs: number;
  bytesProcessed: number;
  rowsAffected: number;
}

// Query result
export interface QueryResult {
  queryId?: string;
  rows: any[];
  rowCount: number;
  executionTime: number;
  fields: Array<{name: string, type: string, dataType: string}>;
  metrics: QueryMetrics;
  columns: Array<{
    name: string;
    dataTypeId: number;
  }>;
}

// Database client
export interface DatabaseClient {
  query: (sql: string, params?: QueryParams[]) => Promise<QueryResult>;
  close: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  connect: () => Promise<void>;
}

// Node types for schema visualization
export interface Node {
  id: string;
  name: string;
  type: 'table' | 'view';
  data?: Record<string, unknown>;
}

export interface Edge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface TableNode extends Node {
  data: {
    columns: ColumnSchema[];
    primaryKeys: string[];
    foreignKeys: ForeignKeyDefinition[];
    label?: string;
  };
}

export interface ProcessedSchemaTable {
  name: string;
  type: 'table';
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
  relationships: Array<{
    table: string;
    columns: Array<{
      from: string;
      to: string;
    }>;
  }>;
}

// Query history
export interface QueryHistory {
  id: string;
  userId: string;
  connectionId: string;
  query: string;
  status: 'success' | 'error';
  error: string | null;
  executionTimeMs: number | null;
  rowCount: number | null;
  createdAt: Date;
}

// Table data response
export interface TableDataResponse {
  data: Record<string, DatabaseValue>[];
  totalRows: number;
  page?: number;
  pageSize?: number;
}

// Session data
export interface SessionData {
  userId: string;
  organizationId?: string;
  activeConnectionId?: string;
  remember?: boolean;
  expiresAt?: Date;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

// User session
export interface UserSession {
  user: User;
  organization?: Organization;
  activeConnection?: DatabaseConnection;
  permissions: {
    organizationRole?: Role;
    connectionPermissions: string[];
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
  channels: Set<string>;
}

// User with organization
export interface UserWithOrganization extends User {
  organizationMemberships: OrganizationMembership[];
  currentOrganization?: Organization;
  id: string;
  email: string;
  name: string;
}

// Query restriction
export interface QueryRestriction {
  maxRowsPerQuery?: number;
  allowedTables?: string[];
  allowedSchemas?: string[];
  blockedTables?: string[];
  blockedSchemas?: string[];
  timeoutSeconds?: number;
}

// Permission
export interface Permission {
  userId: string;
  isAdmin: boolean;
  canConnect: boolean;
  queryRestrictions: QueryRestriction;
}
