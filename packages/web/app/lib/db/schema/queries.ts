import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { databaseConnections } from "./connections";

export const queryHistory = pgTable("query_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => databaseConnections.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  executionTimeMs: integer("execution_time_ms"),
  rowCount: integer("row_count"),
  error: text("error"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const queryHistoryRelations = relations(queryHistory, ({ one }) => ({
  connection: one(databaseConnections, {
    fields: [queryHistory.connectionId],
    references: [databaseConnections.id],
  }),
  user: one(users, {
    fields: [queryHistory.userId],
    references: [users.id],
  }),
}));
