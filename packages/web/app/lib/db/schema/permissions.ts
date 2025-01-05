import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { databaseConnections } from './connections';

export const connectionPermissions = pgTable('connection_permissions', {
  id: uuid('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => databaseConnections.id),
  isAdmin: boolean('is_admin').notNull().default(false),
  canConnect: boolean('can_connect').notNull().default(false),
  queryRestrictions: jsonb('query_restrictions'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const connectionPermissionsRelations = relations(connectionPermissions, ({ one }) => ({
  user: one(users, {
    fields: [connectionPermissions.userId],
    references: [users.id],
  }),
  connection: one(databaseConnections, {
    fields: [connectionPermissions.connectionId],
    references: [databaseConnections.id],
  }),
}));

// Types
export type ConnectionPermission = typeof connectionPermissions.$inferSelect;
export type NewConnectionPermission = typeof connectionPermissions.$inferInsert;

export type QueryRestriction = {
  allowedTables?: string[];
  allowedSchemas?: string[];
  maxRowsPerQuery?: number;
  timeoutSeconds?: number;
};

export type Permission = {
  userId: string;
  isAdmin: boolean;
  canConnect: boolean;
  queryRestrictions?: QueryRestriction;
};

