import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Role enum
export const Role = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export type Role = z.infer<typeof Role>;

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password').notNull(),
  organizationId: uuid('organization_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login')
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const organizationMemberships = pgTable('organization_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);

export const insertOrganizationMembershipSchema = createInsertSchema(organizationMemberships);
export const selectOrganizationMembershipSchema = createSelectSchema(organizationMemberships);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMembership = typeof organizationMemberships.$inferSelect;
export type NewOrganizationMembership = typeof organizationMemberships.$inferInsert;

// Extended types
export interface UserWithOrganization extends User {
  organizationMemberships: OrganizationMembership[];
  currentOrganization?: Organization;
}

export interface OrganizationWithRole extends Organization {
  role: Role;
  members?: OrganizationMembership[];
}

// Relations
export const usersRelations = {
  organization: {
    type: 'one',
    schema: organizations,
    fields: [users.organizationId],
    references: [organizations.id]
  }
};

export const organizationsRelations = {
  createdBy: {
    type: 'one',
    schema: users,
    fields: [organizations.createdById],
    references: [users.id]
  },
  members: {
    type: 'many',
    schema: organizationMemberships,
    fields: [organizations.id],
    references: [organizationMemberships.organizationId]
  }
};

export const organizationMembershipsRelations = {
  organization: {
    type: 'one',
    schema: organizations,
    fields: [organizationMemberships.organizationId],
    references: [organizations.id]
  },
  user: {
    type: 'one',
    schema: users,
    fields: [organizationMemberships.userId],
    references: [users.id]
  }
}; 