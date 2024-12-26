import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import type { InferModel } from "drizzle-orm";

export const databaseConnections = pgTable('connections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['POSTGRES', 'MYSQL', 'SQLITE', 'MSSQL', 'ORACLE', 'MONGODB', 'REDIS'] }).notNull(),
  host: text('host'),
  port: text('port'),
  database: text('database'),
  username: text('username'),
  password: text('password'),
  ssl: boolean('ssl').default(false),
  filepath: text('filepath'),
  authSource: text('auth_source'),
  replicaSet: text('replica_set'),
  organizationId: text('organization_id').notNull(),
});

export const databaseConnectionsRelations = relations(databaseConnections, ({ one }) => ({
  organization: one(organizations, {
    fields: [databaseConnections.organizationId],
    references: [organizations.id],
  }),
}));

// Zod schemas for validation
export const insertDatabaseConnectionSchema = createInsertSchema(databaseConnections, {
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"]),
});

export const selectDatabaseConnectionSchema = createSelectSchema(databaseConnections);

export type DatabaseConnection = InferModel<typeof databaseConnections>;
export type NewDatabaseConnection = InferModel<typeof databaseConnections, "insert">;
export type ConnectionType = DatabaseConnection['type'];

// Connection config types
export interface ConnectionConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface StandardConnectionConfig extends ConnectionConfig {
  type: ConnectionType;
  name: string;
}

export interface PostgresConnectionConfig extends StandardConnectionConfig {
  type: "POSTGRES";
}

export interface MySQLConnectionConfig extends StandardConnectionConfig {
  type: "MYSQL";
}

export interface SQLiteConnectionConfig extends StandardConnectionConfig {
  type: "SQLITE";
}

export interface MSSQLConnectionConfig extends StandardConnectionConfig {
  type: "MSSQL";
}

export interface OracleConnectionConfig extends StandardConnectionConfig {
  type: "ORACLE";
}

export interface MongoDBConnectionConfig extends StandardConnectionConfig {
  type: "MONGODB";
}

export interface RedisConnectionConfig extends StandardConnectionConfig {
  type: "REDIS";
}
