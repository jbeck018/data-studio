import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizations } from './organizations';

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

export const connectionPermissions = pgTable('connection_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').notNull().references(() => databaseConnections.id),
  userId: uuid('user_id').notNull(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  isAdmin: boolean('is_admin').notNull().default(false),
  canConnect: boolean('can_connect').notNull().default(false),
  canRead: boolean('can_read').notNull().default(false),
  canWrite: boolean('can_write').notNull().default(false),
  canDelete: boolean('can_delete').notNull().default(false),
  canGrant: boolean('can_grant').notNull().default(false),
  queryRestrictions: jsonb('query_restrictions'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas for validation
export const insertConnectionSchema = createInsertSchema(databaseConnections);
export const selectConnectionSchema = createSelectSchema(databaseConnections);

export const insertConnectionPermissionSchema = createInsertSchema(connectionPermissions);
export const selectConnectionPermissionSchema = createSelectSchema(connectionPermissions);

// Types
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type NewDatabaseConnection = typeof databaseConnections.$inferInsert;
export type ConnectionPermission = typeof connectionPermissions.$inferSelect;
export type NewConnectionPermission = typeof connectionPermissions.$inferInsert;

// Relations
export const databaseConnectionsRelations = {
  organization: {
    type: 'one',
    schema: organizations,
    fields: [databaseConnections.organizationId],
    references: [organizations.id]
  },
  permissions: {
    type: 'many',
    schema: connectionPermissions,
    fields: [databaseConnections.id],
    references: [connectionPermissions.connectionId]
  }
};

export const connectionPermissionsRelations = {
  connection: {
    type: 'one',
    schema: databaseConnections,
    fields: [connectionPermissions.connectionId],
    references: [databaseConnections.id]
  },
  organization: {
    type: 'one',
    schema: organizations,
    fields: [connectionPermissions.organizationId],
    references: [organizations.id]
  }
};

