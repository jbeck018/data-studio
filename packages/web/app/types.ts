import type { Organization as DrizzleOrganization, User as DrizzleUser } from "~/lib/db/schema/auth";

// Extend the base Organization type with additional properties
export interface Organization extends DrizzleOrganization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members?: OrganizationMembership[];
}

// Define the OrganizationMembership type
export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Role type
export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

// Extend the base User type with additional properties
export interface User extends DrizzleUser {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  organizationId: string | null;
  organizationMemberships?: OrganizationMembership[];
  currentOrganization?: Organization;
}

// Extend the base User type with organization relationships
export interface UserWithOrganization extends User {
  organization: Organization;
  organizationMemberships: OrganizationMembership[];
  currentOrganization: Organization;
}

// Database connection types
export type ConnectionType = "POSTGRES" | "MYSQL" | "SQLITE" | "MONGODB" | "REDIS";

// Database connection configuration
export interface ConnectionConfig {
  type: "POSTGRES" | "MYSQL" | "SQLITE" | "MONGODB" | "REDIS";
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  filepath?: string;
}

// Database connection
export interface DatabaseConnection extends ConnectionConfig {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  lastUsed: Date | null;
}

// Table schema column
export interface ColumnSchema {
  columnName: string;
  name: string;
  type: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

// Table schema
export interface TableSchema {
  tableName: string;
  name: string;
  connectionId: string;
  columns: ColumnSchema[];
  primaryKeys: string[] | null;
  foreignKeys: any[];
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
  fields: QueryField[];
  rows: Record<string, any>[];
  rowCount: number;
  metrics: QueryMetrics;
}

// Database client
export interface DatabaseClient {
  query: (sql: string, params?: any[]) => Promise<QueryResult>;
  close: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

// Node types for schema visualization
export interface Node {
  id: string;
  name: string;
  type: "table" | "view";
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
    foreignKeys: {
      columnName: string;
      referencedTable: string;
      referencedColumn: string;
    }[];
  };
}

export interface ProcessedSchemaTable {
  name: string;
  type: "table";
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

export interface ConnectionPermission {
  id: string;
  userId: string;
  connectionId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface TableDataResponse {
  data: Record<string, any>[];
  totalRows: number;
  page?: number;
  pageSize?: number;
}

export interface SessionData {
  userId: string;
  organizationId?: string;
  activeConnectionId?: string;
  remember?: boolean;
  expiresAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface UserSession {
  user: User;
  organization?: Organization;
  activeConnection?: DatabaseConnection;
  permissions: {
    organizationRole?: Role;
    connectionPermissions: string[];
  };
}

export interface OrganizationWithRole extends Organization {
  role: Role;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
  channels: Set<string>;
}
