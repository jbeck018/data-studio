import { text, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { databaseConnections } from "./connections";
import { v4 as uuidv4 } from "uuid";

export const queries = pgTable("query_history", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv4()),
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
