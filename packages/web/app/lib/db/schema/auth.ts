import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "MEMBER", "VIEWER"]);

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .$defaultFn(() => uuidv4())
      .primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    hashedPassword: text("hashed_password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLogin: timestamp("last_login"),
    organizationId: text("organization_id").references(() => organizations.id),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const usersRelations = relations(users, ({ many, one }) => ({
  organizationMemberships: many(organizationMemberships),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const organizations = pgTable("organizations", {
  id: text("id")
    .$defaultFn(() => uuidv4())
    .primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMemberships),
  users: many(users),
  databaseConnections: many(databaseConnections),
}));

export const organizationMemberships = pgTable("organization_memberships", {
  id: text("id")
    .$defaultFn(() => uuidv4())
    .primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationMembershipsRelations = relations(organizationMemberships, ({ one }) => ({
  user: one(users, {
    fields: [organizationMemberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [organizationMemberships.organizationId],
    references: [organizations.id],
  }),
}));

export const databaseConnections = pgTable("database_connections", {
  id: text("id")
    .$defaultFn(() => uuidv4())
    .primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  host: text("host").notNull(),
  port: text("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  database: text("database").notNull(),
  ssl: text("ssl"),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
});

export const databaseConnectionsRelations = relations(databaseConnections, ({ one }) => ({
  organization: one(organizations, {
    fields: [databaseConnections.organizationId],
    references: [organizations.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationMembership = typeof organizationMemberships.$inferSelect;
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
