import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizations } from './organizations';
import { connectionPermissions } from './permissions';
import { relations } from 'drizzle-orm';

// Connection type enum
export const ConnectionType = z.enum(['POSTGRES', 'MYSQL', 'SQLITE', 'MSSQL', 'ORACLE', 'MONGODB', 'REDIS']);
export type ConnectionType = z.infer<typeof ConnectionType>;

// Connection config schema
export const ConnectionConfigSchema = z.object({
  type: ConnectionType,
  name: z.string(),
  host: z.string().nullable(),
  port: z.string().nullable(),
  database: z.string().nullable(),
  username: z.string().nullable(),
  password: z.string().nullable(),
  ssl: z.boolean().nullable(),
  filepath: z.string().nullable()
});

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

// Tables
export const databaseConnections = pgTable('database_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['POSTGRES', 'MYSQL', 'SQLITE', 'MSSQL', 'ORACLE', 'MONGODB', 'REDIS'] }).notNull(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  host: text('host'),
  port: text('port'),
  database: text('database'),
  username: text('username'),
  password: text('password'),
  ssl: boolean('ssl'),
  filepath: text('filepath'),
  authSource: text('auth_source'),
  replicaSet: text('replica_set'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at')
});

export const databaseConnectionsRelations = relations(databaseConnections, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [databaseConnections.organizationId],
    references: [organizations.id]
  }),
  permissions: many(connectionPermissions),
}));

// Zod schemas for validation
export const insertConnectionSchema = createInsertSchema(databaseConnections);
export const selectConnectionSchema = createSelectSchema(databaseConnections);

// Types
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type NewDatabaseConnection = typeof databaseConnections.$inferInsert;

