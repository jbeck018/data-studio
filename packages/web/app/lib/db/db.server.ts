import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

import { env } from '../../env.server';

// Create system database connection pool
const pool = new pg.Pool({
  host: env.SYSTEM_DB_HOST,
  port: env.SYSTEM_DB_PORT,
  user: env.SYSTEM_DB_USER,
  password: env.SYSTEM_DB_PASSWORD,
  database: env.SYSTEM_DB_NAME,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize the pool by creating a connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database', err);
    return;
  }
  done(); // Release the client back to the pool
});

// Create drizzle database instance with schema type
export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === 'development',
});

// Ensure pool is cleaned up when the app shuts down
process.on('SIGTERM', () => {
  pool.end().then(() => {
    console.log('Database pool has ended')
  });
});

// Also handle SIGINT
process.on('SIGINT', () => {
  pool.end().then(() => {
    console.log('Database pool has ended')
    process.exit();
  });
});
