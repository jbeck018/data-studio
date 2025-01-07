import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationMemberships } from './organizations';
import { connectionPermissions } from './permissions';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password').notNull(),
  organizationId: uuid('organization_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login'),
});

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMemberships),
  connectionPermissions: many(connectionPermissions),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Role types
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const ROLE_LEVELS = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
  VIEWER: 0,
} as const;

// Extended types with relations
export type UserWithRelations = User & {
  organizationMemberships?: typeof organizationMemberships.$inferSelect[];
  connectionPermissions?: typeof connectionPermissions.$inferSelect[];
};

export type UserWithOrganization = UserWithRelations & {
  organization: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  currentOrganization: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
