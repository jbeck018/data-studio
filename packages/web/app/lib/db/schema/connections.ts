import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./auth";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import type { InferModel } from "drizzle-orm";

export type DatabaseConnectionType =
  | "POSTGRES"
  | "MYSQL"
  | "MONGODB"
  | "REDIS"
  | "SQLITE";

export const databaseConnections = pgTable("database_connections", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["POSTGRES", "MYSQL", "MONGODB", "REDIS", "SQLITE"] }).notNull(),
  host: text("host").notNull(),
  port: text("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  database: text("database").notNull(),
  ssl: text("ssl"),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  archived: boolean("archived").default(false).notNull(),
});

export const databaseConnectionsRelations = relations(databaseConnections, ({ one }) => ({
  organization: one(organizations, {
    fields: [databaseConnections.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [databaseConnections.createdById],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertDatabaseConnectionSchema = createInsertSchema(databaseConnections, {
  type: z.enum(["POSTGRES", "MYSQL", "MONGODB", "REDIS", "SQLITE"]),
  ssl: z.string().nullable(),
});

export const selectDatabaseConnectionSchema = createSelectSchema(databaseConnections);

export type DatabaseConnection = InferModel<typeof databaseConnections>;
export type NewDatabaseConnection = InferModel<typeof databaseConnections, "insert">;

// Connection config types
export interface ConnectionConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  ssl?: string | null;
}

export interface StandardConnectionConfig extends ConnectionConfig {
  type: DatabaseConnectionType;
  name: string;
}

export interface PostgresConnectionConfig extends StandardConnectionConfig {
  type: "POSTGRES";
}

export interface MySQLConnectionConfig extends StandardConnectionConfig {
  type: "MYSQL";
}

export interface MongoDBConnectionConfig extends StandardConnectionConfig {
  type: "MONGODB";
}

export interface RedisConnectionConfig extends StandardConnectionConfig {
  type: "REDIS";
}

export interface SQLiteConnectionConfig extends StandardConnectionConfig {
  type: "SQLITE";
}
