import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization members table (many-to-many relationship)
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'admin', 'member'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Database connections table
export const databaseConnections = pgTable('database_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'postgresql', etc.
  // Encrypted connection details stored as JSON
  credentials: jsonb('credentials').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastConnectedAt: timestamp('last_connected_at'),
});

// Saved queries table
export const savedQueries = pgTable('saved_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  connectionId: uuid('connection_id').notNull().references(() => databaseConnections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  query: text('query').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Query history table
export const queryHistory = pgTable('query_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  connectionId: uuid('connection_id').notNull().references(() => databaseConnections.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  query: text('query').notNull(),
  executionTimeMs: text('execution_time_ms'),
  status: text('status').notNull(), // 'success', 'error'
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  connections: many(databaseConnections),
  savedQueries: many(savedQueries),
  queryHistory: many(queryHistory),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationMembers),
  savedQueries: many(savedQueries),
  queryHistory: many(queryHistory),
}));

// Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertUserSchema = createInsertSchema(users);
export const insertDatabaseConnectionSchema = createInsertSchema(databaseConnections);
export const insertSavedQuerySchema = createInsertSchema(savedQueries);

// Export select schemas
export const selectOrganizationSchema = createSelectSchema(organizations);
export const selectUserSchema = createSelectSchema(users);
export const selectDatabaseConnectionSchema = createSelectSchema(databaseConnections);
export const selectSavedQuerySchema = createSelectSchema(savedQueries);
