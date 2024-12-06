import { text, timestamp, pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { users } from "./auth";
import { organizations } from "./organizations";
import { databaseConnections } from "./connections";
import { relations } from "drizzle-orm";

export type AuditEventType =
  | 'CONNECTION_ACCESS'      // Connection access events
  | 'QUERY_EXECUTION'        // Query execution events
  | 'PERMISSION_CHANGE'      // Permission changes
  | 'SECURITY_EVENT'         // Security-related events
  | 'USER_ACTION';           // General user actions

export type AuditEventStatus = 'SUCCESS' | 'FAILURE' | 'WARNING';

export interface AuditEventMetadata {
  connectionId?: string;
  queryId?: string;
  sql?: string;
  rowCount?: number;
  executionTime?: number;
  errorMessage?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  targetUserId?: string;
  targetResource?: string;
  additionalInfo?: Record<string, any>;
}

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  eventType: text("event_type").notNull(),
  eventStatus: text("event_status").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<AuditEventMetadata>(),
});

// Relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [auditLog.organizationId],
    references: [organizations.id],
  }),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
