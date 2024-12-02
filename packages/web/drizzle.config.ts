import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './app/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.SYSTEM_DB_HOST || 'localhost',
    port: Number(process.env.SYSTEM_DB_PORT) || 5432,
    user: process.env.SYSTEM_DB_USER || 'postgres',
    password: process.env.SYSTEM_DB_PASSWORD || 'postgres',
    database: process.env.SYSTEM_DB_NAME || 'postgres',
    ssl: false
  },
  verbose: true,
  strict: true,
});
