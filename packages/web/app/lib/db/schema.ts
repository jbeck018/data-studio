import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Import all schemas
import * as auth from "./schema/auth";
import * as connections from "./schema/connections";

// Create database pool
const pool = new Pool({
  host: process.env.SYSTEM_DB_HOST,
  port: Number(process.env.SYSTEM_DB_PORT),
  user: process.env.SYSTEM_DB_USER,
  password: process.env.SYSTEM_DB_PASSWORD,
  database: process.env.SYSTEM_DB_NAME,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create database instance
export const db = drizzle(pool, {
  schema: {
    ...auth,
    ...connections,
  },
});

// Export all schemas
export * from "./schema/auth";
export * from "./schema/connections";
