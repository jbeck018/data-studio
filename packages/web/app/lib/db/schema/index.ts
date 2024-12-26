import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as audit from './audit';
import * as organizations from "./organizations";
import * as connections from "./connections";
import * as queries from "./queries";
import * as permissions from "./permissions";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const schema = {
  ...audit,
  ...organizations,
  ...connections,
  ...queries,
  ...permissions
};

export const db = drizzle(pool, { schema });

export type Database = typeof db;

// Run migrations
if (process.env.NODE_ENV !== "test") {
  migrate(db, { migrationsFolder: "./drizzle" }).catch((err) => {
    console.error("Error running migrations:", err);
  });
}

// Ensure there are no overlapping exports and clarify any ambiguous exports
export * from './connections';
export * from './organizations';
export * from './audit';
export * from './queries';
export * from './users';
export * from './permissions';
