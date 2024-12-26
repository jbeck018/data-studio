import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { relations } from "drizzle-orm";

import * as auth from "./auth";
import * as organizations from "./organizations";
import * as connections from "./connections";
import * as queries from "./queries";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const schema = {
  ...auth,
  ...organizations,
  ...connections,
  ...queries,
};

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

export const db = drizzle(pool, { schema });

export type Database = typeof db;

// Run migrations
if (process.env.NODE_ENV !== "test") {
  migrate(db, { migrationsFolder: "./drizzle" }).catch((err) => {
    console.error("Error running migrations:", err);
  });
}

export * from "./auth";
export * from "./organizations";
export * from "./connections";
export * from "./queries";
