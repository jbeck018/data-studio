import { text, timestamp, pgTable, jsonb, uuid } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations";
import { users } from "./auth";

export const databaseConnections = pgTable("database_connections", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  type: text("type", { enum: ["postgresql"] }).notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  config: jsonb("config").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type NewDatabaseConnection = typeof databaseConnections.$inferInsert;

export interface PostgresConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export const queryHistory = pgTable("query_history", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
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
