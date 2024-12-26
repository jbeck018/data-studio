import { text, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { databaseConnections } from "./connections";
import { v4 as uuidv4 } from "uuid";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";

export const queryHistory = pgTable("query_history", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => databaseConnections.id),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  sql: text("sql").notNull(),
  status: text("status", { enum: ["success", "error"] }).notNull(),
  error: text("error"),
  executionTimeMs: text("execution_time_ms"),
  rowCount: text("row_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const queryHistoryRelations = relations(queryHistory, ({ one }) => ({
  user: one(users, {
    fields: [queryHistory.userId],
    references: [users.id],
  }),
  connection: one(databaseConnections, {
    fields: [queryHistory.connectionId],
    references: [databaseConnections.id],
  }),
  organization: one(organizations, {
    fields: [queryHistory.organizationId],
    references: [organizations.id],
  }),
}));

// Types
export type QueryHistory = typeof queryHistory.$inferSelect;
export type NewQueryHistory = typeof queryHistory.$inferInsert;
