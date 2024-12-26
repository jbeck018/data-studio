import { text, timestamp, pgTable, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { organizations } from "./organizations";
import { users } from "./auth";
import { databaseConnections } from "./connections";
import { relations } from "drizzle-orm";

export interface QueryRestriction {
  maxRowsPerQuery?: number;
  allowedSchemas?: string[];
  allowedTables?: string[];
  blockedTables?: string[];
  allowedOperations?: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER')[];
  maxConcurrentQueries?: number;
}

// Connection-level permissions
export const connectionPermissions = pgTable("connection_permissions", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
  connectionId: uuid("connection_id").notNull().references(() => databaseConnections.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  isAdmin: boolean("is_admin").default(false).notNull(),
  canConnect: boolean("can_connect").default(true).notNull(),
  canRead: boolean("can_read").default(true).notNull(),
  canWrite: boolean("can_write").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  canGrant: boolean("can_grant").default(false).notNull(),
  queryRestrictions: jsonb("query_restrictions").$type<QueryRestriction>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const connectionPermissionsRelations = relations(connectionPermissions, ({ one }) => ({
  connection: one(databaseConnections, {
    fields: [connectionPermissions.connectionId],
    references: [databaseConnections.id],
  }),
  user: one(users, {
    fields: [connectionPermissions.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [connectionPermissions.organizationId],
    references: [organizations.id],
  }),
}));

export type ConnectionPermission = typeof connectionPermissions.$inferSelect;
export type NewConnectionPermission = typeof connectionPermissions.$inferInsert;
