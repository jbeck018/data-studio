import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

import { env } from '~/env.server';
import * as schema from './schema';

// Create system database connection pool
const pool = new Pool({
  host: env.SYSTEM_DB_HOST,
  port: env.SYSTEM_DB_PORT,
  user: env.SYSTEM_DB_USER,
  password: env.SYSTEM_DB_PASSWORD,
  database: env.SYSTEM_DB_NAME,
});

// Create drizzle database instance with schema type
export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === 'development',
});
