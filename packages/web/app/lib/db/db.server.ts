import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

import { env } from '../../env.server';

// Create system database connection pool
const pool = new pg.Client({
  host: env.SYSTEM_DB_HOST,
  port: env.SYSTEM_DB_PORT,
  user: env.SYSTEM_DB_USER,
  password: env.SYSTEM_DB_PASSWORD,
  database: env.SYSTEM_DB_NAME,
});

// Create drizzle database instance with schema type
export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === 'development',
});
