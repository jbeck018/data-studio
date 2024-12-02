// Export database types
export const DATABASE_TYPES = ['POSTGRES', 'MYSQL', 'SQLITE', 'MSSQL', 'ORACLE', 'MONGODB', 'REDIS'] as const;
export type DatabaseType = typeof DATABASE_TYPES[number];

// Re-export all schemas and types
export * from './schema/organizations';
export * from './schema/auth';
export * from './schema/connections';
export * from './schema/queries';

// Import for relations
import { relations } from 'drizzle-orm';
import { organizations, organizationMembers } from './schema/organizations';
import { users } from './schema/auth';
import { databaseConnections } from './schema/connections';

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  connections: many(databaseConnections),
}));

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
}));

// Organization member relations
export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

// Database connection relations
export const databaseConnectionsRelations = relations(databaseConnections, ({ one }) => ({
  organization: one(organizations, {
    fields: [databaseConnections.organizationId],
    references: [organizations.id],
  }),
}));
