import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Import all schemas
import * as auth from "./auth";
import * as connections from "./connections";
import * as queries from "./queries";
import * as audit from "./audit";

// Re-export specific types to avoid ambiguity
export {
  User,
  Organization,
  OrganizationMembership,
  Role,
  type NewUser,
  type NewOrganization,
  type NewOrganizationMembership
} from "./auth";

export {
  ConnectionType,
  type ConnectionConfig,
  type DatabaseConnection,
  type NewDatabaseConnection,
  type ConnectionPermission,
  type NewConnectionPermission
} from "./connections";

export {
  type QueryHistory,
  type NewQueryHistory
} from "./queries";

export {
  type AuditLog,
  type NewAuditLog
} from "./audit";

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
const pool = new Pool({
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
    ...auth,
    ...connections,
    ...queries,
    ...audit,
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
} = {
  ...auth,
  ...connections,
  ...queries,
  ...audit,
};
