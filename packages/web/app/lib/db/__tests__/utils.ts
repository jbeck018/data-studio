import { db } from '../db.server';
import { v4 as uuidv4 } from 'uuid';
import { users, organizations, organizationMembers, connections } from '../schema';
import type { 
  User, NewUser,
  Organization, NewOrganization,
  OrganizationMember, NewOrganizationMember,
  DatabaseType,
  BaseConnectionConfig,
  StandardConnectionConfig,
  MongoDBConnectionConfig,
  RedisConnectionConfig,
  SQLiteConnectionConfig
} from '../schema';
import { hash } from '@node-rs/bcrypt';
import { createCookieSessionStorage } from '@remix-run/node';

type ConnectionConfig = StandardConnectionConfig | MongoDBConnectionConfig | RedisConnectionConfig | SQLiteConnectionConfig;
type Role = 'owner' | 'admin' | 'member';

const testSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'data_studio_test_session',
    secrets: ['test-secret'],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createTestUser(
  email: string = 'test@example.com',
  password: string = 'test-password'
): Promise<User> {
  const hashedPassword = await hash(password, 10);
  const newUser: NewUser = {
    id: uuidv4(),
    email,
    name: 'Test User',
    hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  };

  const [user] = await db.insert(users)
    .values(newUser)
    .returning();
  return user;
}

export async function createTestOrganization(
  name: string = 'Test Organization',
  createdById?: string
): Promise<Organization> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newOrg: NewOrganization = {
    id: uuidv4(),
    name,
    slug,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [org] = await db.insert(organizations)
    .values(newOrg)
    .returning();
  return org;
}

export async function createTestOrganizationMember(
  userId: string,
  organizationId: string,
  role: Role = 'member'
): Promise<OrganizationMember> {
  const newMember: NewOrganizationMember = {
    id: uuidv4(),
    userId,
    organizationId,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [member] = await db.insert(organizationMembers)
    .values(newMember)
    .returning();
  return member;
}

export async function createTestConnection(
  organizationId: string,
  createdById: string,
  config: Partial<ConnectionConfig> = {}
) {
  const defaultConfig: StandardConnectionConfig = {
    type: 'POSTGRES',
    host: 'localhost',
    port: 5432,
    database: 'test',
    username: 'test',
    password: 'test',
    ssl: false
  };

  const mergedConfig = { ...defaultConfig, ...config };
  const [connection] = await db.insert(connections).values({
    id: uuidv4(),
    name: 'Test Connection',
    type: mergedConfig.type,
    organizationId,
    createdById,
    config: mergedConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false
  }).returning();

  return connection;
}

export async function createTestUserWithOrg(
  email?: string,
  orgName?: string,
  role: Role = 'owner'
) {
  const user = await createTestUser(email);
  const org = await createTestOrganization(orgName, user.id);
  const member = await createTestOrganizationMember(user.id, org.id, role);
  return { user, org, member };
}

export async function createTestUserWithOrgAndConnection(
  email?: string,
  orgName?: string,
  config: Partial<ConnectionConfig> = {}
) {
  const { user, org } = await createTestUserWithOrg(email, orgName);
  const connection = await createTestConnection(org.id, user.id, config);
  return { user, org, connection };
}

interface TestSession {
  userId: string;
  organizationId?: string;
  activeConnectionId?: string;
  remember?: boolean;
  expiresAt?: Date;
}

export async function createTestSession({
  userId,
  organizationId,
  activeConnectionId,
  remember = false,
  expiresAt
}: TestSession) {
  const session = await testSessionStorage.getSession();
  session.set('userId', userId);
  if (organizationId) session.set('organizationId', organizationId);
  if (activeConnectionId) session.set('activeConnectionId', activeConnectionId);
  session.set('remember', remember);
  
  if (!expiresAt) {
    expiresAt = remember 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000);      // 24 hours
  }
  session.set('expiresAt', expiresAt);

  const cookie = await testSessionStorage.commitSession(session);
  return { session, cookie };
}

export async function cleanupTestData() {
  await db.delete(connections);
  await db.delete(organizationMembers);
  await db.delete(organizations);
  await db.delete(users);
}
