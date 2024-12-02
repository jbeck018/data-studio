import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { db } from "../lib/db/db.server";
import { users, organizationMembers, databaseConnections } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';
import { getUserOrganizationRole, getUserOrganizationPermissions, Role } from "../lib/auth/rbac.server";

export type User = InferSelectModel<typeof users> & {
  organizationMemberships: Array<{
    organizationId: string;
    role: Role;
  }>;
  currentOrganization: string | null;
  organizationRole: Role | null;
  organizationPermissions: string[] | null;
  hasConnection: boolean;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret-please-change"],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const ORGANIZATION_SESSION_KEY = "organizationId";
const SESSION_EXPIRY = 60 * 60 * 24 * 30; // 30 days

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  currentPassword?: string;
}

export async function createUser({ email, password, name }: CreateUserInput): Promise<User> {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(users).values({
    email,
    name,
    passwordHash: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return {
    ...user,
    organizationMemberships: [],
    currentOrganization: null,
    organizationRole: null,
    organizationPermissions: null,
    hasConnection: false,
  };
}

export async function verifyLogin(email: string, password: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // Get user organization memberships
  const organizationMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
    columns: {
      organizationId: true,
      role: true,
    },
  });

  return {
    ...user,
    organizationMemberships: organizationMemberships.map(org => ({
      organizationId: org.organizationId,
      role: org.role as Role,
    })),
    currentOrganization: null,
    organizationRole: null,
    organizationPermissions: null,
    hasConnection: false,
  };
}

export async function createUserSession({
  request,
  userId,
  organizationId = null,
  remember = false,
  redirectTo,
}: {
  request: Request;
  userId: string;
  organizationId?: string | null;
  remember?: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  if (organizationId) {
    session.set(ORGANIZATION_SESSION_KEY, organizationId);
  }

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? SESSION_EXPIRY : undefined,
      }),
    },
  });
}

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserSession(request: Request) {
  const session = await getSession(request);
  return {
    userId: session.get(USER_SESSION_KEY),
    organizationId: session.get(ORGANIZATION_SESSION_KEY),
  };
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request): Promise<User | null> {
  const session = await getUserSession(request);
  const userId = session.userId;
  const organizationId = session.organizationId;
  
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      lastLogin: true,
      passwordHash: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw await logout(request);
  }

  // Get user organization memberships
  const organizationMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
    columns: {
      organizationId: true,
      role: true,
    },
  });

  // Map the memberships to include the correct role type
  const typedMemberships = organizationMemberships.map(membership => ({
    organizationId: membership.organizationId,
    role: membership.role as Role
  }));

  // If no organization is selected but user has organizations, select the first one
  if (!organizationId && typedMemberships.length > 0) {
    const session = await getSession(request);
    session.set(ORGANIZATION_SESSION_KEY, typedMemberships[0].organizationId);
    throw redirect(request.url, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  // Get current organization details if selected
  let organizationRole = null;
  let organizationPermissions = null;
  let hasConnection = false;

  if (organizationId) {
    [organizationRole, organizationPermissions, hasConnection] = await Promise.all([
      getUserOrganizationRole(user.id, organizationId),
      getUserOrganizationPermissions(user.id, organizationId),
      db.query.databaseConnections.findFirst({
        where: eq(databaseConnections.organizationId, organizationId),
      }).then(Boolean)
    ]);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    passwordHash: user.passwordHash,
    updatedAt: user.updatedAt,
    organizationMemberships: typedMemberships,
    currentOrganization: organizationId,
    organizationRole,
    organizationPermissions,
    hasConnection
  } satisfies User;
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!userResult.length) {
    throw new Error("User not found");
  }

  const user = userResult[0];
  const updates: Partial<typeof user> = {
    updatedAt: new Date(),
  };

  if (input.email) {
    updates.email = input.email;
  }

  if (input.name) {
    updates.name = input.name;
  }

  if (input.password) {
    if (!input.currentPassword) {
      throw new Error("Current password is required to change password");
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    updates.passwordHash = await bcrypt.hash(input.password, 10);
  }

  const result = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  const updatedUser = result[0];

  // Get user organization memberships
  const organizationMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, updatedUser.id),
    columns: {
      organizationId: true,
      role: true,
    },
  });

  return {
    ...updatedUser,
    organizationMemberships: organizationMemberships.map(org => ({
      organizationId: org.organizationId,
      role: org.role as Role,
    })),
    currentOrganization: null,
    organizationRole: null,
    organizationPermissions: null,
    hasConnection: false,
  };
}
