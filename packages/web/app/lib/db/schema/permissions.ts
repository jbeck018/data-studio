import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	json,
} from "drizzle-orm/pg-core";
import { databaseConnections } from "./connections";
import { users } from "./users";
import { SQLOperation } from '../permissions-manager.server';
import { organizations } from "./organizations";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const connectionPermissions = pgTable("connection_permissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	connectionId: uuid("connection_id")
		.notNull()
		.references(() => databaseConnections.id),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id),
	isAdmin: boolean("is_admin").notNull().default(false),
	canConnect: boolean("can_connect").notNull().default(false),
	canGrant: boolean("can_grant").notNull().default(false),
	canRead: boolean("can_read").notNull().default(false),
	canWrite: boolean("can_write").notNull().default(false),
	canDelete: boolean("can_delete").notNull().default(false),
	queryRestrictions: json("query_restrictions").$type<{
		maxRowsPerQuery: number;
		allowedSchemas: string[];
		allowedTables: string[];
		allowedOperations: SQLOperation[];
	}>(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const connectionPermissionsRelations = relations(
	connectionPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [connectionPermissions.userId],
			references: [users.id],
		}),
		connection: one(databaseConnections, {
			fields: [connectionPermissions.connectionId],
			references: [databaseConnections.id],
		}),
		organization: one(organizations, {
			fields: [connectionPermissions.organizationId],
			references: [organizations.id],
		}),
	}),
);

// Types
export type ConnectionPermission = typeof connectionPermissions.$inferSelect;
export type NewConnectionPermission = typeof connectionPermissions.$inferInsert;

export type QueryRestriction = {
	allowedTables?: string[];
	allowedSchemas?: string[];
	allowedOperations?: string[];
	maxConcurrentQueries?: number;
	maxRowsPerQuery?: number;
	timeoutSeconds?: number;
	blockedTables?: string[];
};

export type Permission = {
	userId: string;
	isAdmin: boolean;
	canConnect: boolean;
	queryRestrictions?: QueryRestriction;
};

export const insertConnectionPermissionSchema = createInsertSchema(connectionPermissions);
export const selectConnectionPermissionSchema = createSelectSchema(connectionPermissions);
