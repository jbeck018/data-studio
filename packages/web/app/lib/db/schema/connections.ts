import { text, timestamp, pgTable, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { organizations } from "./organizations";
import { users } from "./auth";
import { type DatabaseType } from "../schema";

// Common connection config interface
export interface BaseConnectionConfig {
  type: DatabaseType;  // Add type to base config
  host?: string;  // Make these optional in base
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface StandardConnectionConfig extends BaseConnectionConfig {
  type: Exclude<DatabaseType, 'MONGODB' | 'REDIS' | 'SQLITE'>;
  host: string;  // Required for standard connections
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface MongoDBConnectionConfig extends BaseConnectionConfig {
  type: 'MONGODB';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  authSource?: string;
  replicaSet?: string;
}

export interface RedisConnectionConfig extends BaseConnectionConfig {
  type: 'REDIS';
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SQLiteConnectionConfig extends BaseConnectionConfig {
  type: 'SQLITE';
  filepath: string;
}

export type ConnectionConfig = 
  | StandardConnectionConfig
  | MongoDBConnectionConfig
  | RedisConnectionConfig
  | SQLiteConnectionConfig;

export const databaseConnections = pgTable("database_connections", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  type: text("type", { enum: ["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"] }).notNull(),
  config: jsonb("config").$type<ConnectionConfig>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  archived: boolean("archived").notNull().default(false),
});

export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type NewDatabaseConnection = typeof databaseConnections.$inferInsert;

export const queryHistory = pgTable("query_history", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => databaseConnections.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  query: text("query").notNull(),
  status: text("status", { enum: ["success", "error"] }).notNull(),
  error: text("error"),
  executionTimeMs: text("execution_time_ms"),
  rowCount: text("row_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type QueryHistory = typeof queryHistory.$inferSelect;
export type NewQueryHistory = typeof queryHistory.$inferInsert;
