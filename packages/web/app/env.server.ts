import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // System database settings
  SYSTEM_DB_HOST: z.string().default('localhost'),
  SYSTEM_DB_PORT: z.coerce.number().default(5555),
  SYSTEM_DB_USER: z.string().default('postgres'),
  SYSTEM_DB_PASSWORD: z.string().default('postgres'),
  SYSTEM_DB_NAME: z.string().default('postgres'),

  // Session configuration
  SESSION_SECRET: z.string().min(32).default('at-least-32-characters-long-session-secret'),

  // Encryption settings for database credentials
  ENCRYPTION_KEY: z.string().min(32).default('at-least-32-characters-long-encryption-key'),
  ENCRYPTION_IV: z.string().default('16-chars-enc-iv'),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export const env = envSchema.parse(process.env);
