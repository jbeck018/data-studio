import { text, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { databaseConnections } from "./connections";

export const queries = pgTable("query_history", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => databaseConnections.id),
  organizationId: uuid("organization_id").notNull(),
  sql: text("sql").notNull(),
  status: text("status", { enum: ["success", "error"] }).notNull(),
  error: text("error"),
  executionTimeMs: text("execution_time_ms"),
  rowCount: text("row_count"),
  createdAt: timestamp("created_at").defaultNow(),
});
