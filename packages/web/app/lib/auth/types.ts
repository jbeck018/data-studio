import { z } from 'zod';

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const OrganizationMemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
  createdAt: z.date(),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export const DatabaseConnectionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  type: z.enum(['POSTGRES', 'MYSQL']),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DatabaseConnection = z.infer<typeof DatabaseConnectionSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  organizations: z.array(z.object({
    id: z.string(),
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
  })),
  currentOrganization: z.string().nullable(),
  organizationRole: z.enum(['OWNER', 'ADMIN', 'MEMBER']).nullable(),
  organizationPermissions: z.array(z.string()).nullable(),
  hasConnection: z.boolean(),
  createdAt: z.date(),
  lastLogin: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string().nullable(),
  expiresAt: z.date(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_SESSION = 'INVALID_SESSION',
  MISSING_PERMISSIONS = 'MISSING_PERMISSIONS',
  NO_CONNECTION = 'NO_CONNECTION',
  NO_ORGANIZATION = 'NO_ORGANIZATION',
  INVALID_ORGANIZATION = 'INVALID_ORGANIZATION',
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthConfig {
  sessionSecret: string;
  sessionExpiry: number; // in seconds
  secureCookies: boolean;
  allowedRedirects: string[];
}
