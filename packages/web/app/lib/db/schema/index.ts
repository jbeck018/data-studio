import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// Import all schemas
import * as connections from "./connections";
import * as queries from "./queries";
import * as audit from "./audit";
import * as organization from "./organizations";
import * as user from "./users";
import * as permissions from "./permissions";

// Re-export specific types to avoid ambiguity

export * from "./connections";

export * from "./queries";

export * from "./audit";

export * from "./organizations";

export * from "./users";

export * from "./permissions";

// Database connection types
export const DATABASE_TYPES = [
  "POSTGRES",
  "MYSQL",
  "SQLITE",
  "MSSQL",
  "ORACLE",
  "MONGODB",
  "REDIS",
] as const;

export type DatabaseType = typeof DATABASE_TYPES[number];

// Create database pool
const pool = new pg.Pool({
  host: process.env.SYSTEM_DB_HOST,
  port: Number(process.env.SYSTEM_DB_PORT),
  user: process.env.SYSTEM_DB_USER,
  password: process.env.SYSTEM_DB_PASSWORD,
  database: process.env.SYSTEM_DB_NAME,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create database instance
export const db = drizzle(pool, {
  schema: {
    ...audit,
    ...connections,
    ...organization,
    ...permissions,
    ...queries,
    ...user,
  },
});

// Export schema objects
export const {
  users,
  organizations,
  organizationMemberships,
  databaseConnections,
  queryHistory,
  auditLog,
  connectionPermissions,
} = {
  ...connections,
  ...queries,
  ...audit,
  ...organization,
  ...user,
  ...permissions,
};