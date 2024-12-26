import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { relations } from "drizzle-orm";

// Import schema components
import * as auth from "./schema/auth";
import * as organizations from "./schema/organizations";
import * as connections from "./schema/connections";

// Re-export all schema components
export * from "./schema/auth";
export * from "./schema/organizations";
export * from "./schema/connections";

// Create pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define schema
export const schema = {
  ...auth,
  ...organizations,
  ...connections,
};

// Define relations
export const usersRelations = relations(auth.users, ({ many }) => ({
  organizationMemberships: many(organizations.organizationMemberships),
  databaseConnections: many(connections.databaseConnections),
}));

export const organizationsRelations = relations(organizations.organizations, ({ many }) => ({
  members: many(organizations.organizationMemberships),
  connections: many(connections.databaseConnections),
}));

export const organizationMembershipsRelations = relations(organizations.organizationMemberships, ({ one }) => ({
  user: one(auth.users, {
    fields: [organizations.organizationMemberships.userId],
    references: [auth.users.id],
  }),
  organization: one(organizations.organizations, {
    fields: [organizations.organizationMemberships.organizationId],
    references: [organizations.organizations.id],
  }),
}));

export const databaseConnectionsRelations = relations(connections.databaseConnections, ({ one }) => ({
  organization: one(organizations.organizations, {
    fields: [connections.databaseConnections.organizationId],
    references: [organizations.organizations.id],
  }),
  createdBy: one(auth.users, {
    fields: [connections.databaseConnections.createdById],
    references: [auth.users.id],
  }),
}));

// Create db instance
export const db = drizzle(pool, { schema });

// Export types
export type Database = typeof db;
