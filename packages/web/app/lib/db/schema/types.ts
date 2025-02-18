import type { InferSelectModel } from "drizzle-orm";
import type { organizations, users, organizationMemberships, databaseConnections } from "./index";

export type User = InferSelectModel<typeof users>;
export type Organization = InferSelectModel<typeof organizations>;
export type OrganizationMembership = InferSelectModel<typeof organizationMemberships>;
export type DatabaseConnection = InferSelectModel<typeof databaseConnections>;

export type ConnectionType = "POSTGRES" | "MYSQL" | "SQLITE" | "MSSQL" | "ORACLE" | "MONGODB" | "REDIS";
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface ConnectionConfig {
	type: ConnectionType;
	name: string;
	host?: string | null;
	port?: string | null;
	database?: string | null;
	username?: string | null;
	password?: string | null;
	ssl?: boolean | null;
	filepath?: string | null;
	organizationId: string;
}

export interface ConnectionWithStatus extends DatabaseConnection {
	status: ConnectionStatus;
	error?: string | null;
}

export interface ConnectionPermission {
	userId: string;
	connectionId: string;
	isAdmin: boolean;
	canConnect: boolean;
	queryRestrictions: QueryRestriction;
}

export enum Role {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
	VIEWER = "VIEWER"
}

export enum QueryErrorCode {
	INVALID_QUERY = "INVALID_QUERY",
	CONNECTION_ERROR = "CONNECTION_ERROR",
	PERMISSION_DENIED = "PERMISSION_DENIED",
	TIMEOUT = "TIMEOUT",
	CONNECTION_NOT_FOUND = "CONNECTION_NOT_FOUND",
	UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

export class QueryError extends Error {
	constructor(message: string, public code: QueryErrorCode) {
		super(message);
		this.name = "QueryError";
	}
}

export interface OrganizationWithRole extends Organization {
	role: string;
	members?: OrganizationMembership[];
}

export interface UserWithOrganization extends User {
	organizationMemberships?: OrganizationMembership[];
	currentOrganization?: Organization;
	organization?: Organization;
	connectionPermissions?: ConnectionPermission[];
}

export interface Permission {
	userId: string;
	isAdmin: boolean;
	canConnect: boolean;
	queryRestrictions: QueryRestriction;
}

export interface QueryRestriction {
	maxRowsPerQuery?: number;
	allowedTables?: string[];
	allowedSchemas?: string[];
	blockedTables?: string[];
	blockedSchemas?: string[];
	timeoutSeconds?: number;
}

export interface TableSchema {
	tableName: string;
	name: string;
	connectionId: string;
	columns: ColumnSchema[];
	primaryKeys: string[] | null;
	foreignKeys: ForeignKeySchema[];
	rowCount: number;
	sizeInBytes: number;
}

export interface ColumnSchema {
	columnName: string;
	name: string;
	type: string;
	dataType: string;
	isNullable: boolean;
	nullable: boolean;
	defaultValue: string | null;
	isPrimaryKey: boolean;
	isForeignKey: boolean;
}

export interface ForeignKeySchema {
	columnName: string;
	referencedTable: string;
	referencedColumn: string;
}

export interface QueryResult {
	fields: QueryField[];
	rows: Record<string, unknown>[];
	rowCount: number;
	metrics: QueryMetrics;
}

export interface QueryField {
	name: string;
	type: string;
	dataType?: string;
}

export interface QueryMetrics {
	executionTimeMs: number;
	bytesProcessed: number;
	rowsAffected: number;
}