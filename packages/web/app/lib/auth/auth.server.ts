import { db } from "~/lib/db/db.server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { UserWithOrganization } from "~/lib/db/schema/types";
import { createCookieSessionStorage, redirect } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { organizationMemberships, organizations } from "../db/schema";
import { users } from "../db/schema";

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create organization first
  const [organization] = await db.insert(organizations)
    .values({
      id: uuidv4(),
      name: `${name}'s Organization`,
    })
    .returning();

  // Create user
  const [user] = await db.insert(users)
    .values({
      id: uuidv4(),
      email,
      name,
      hashedPassword,
      organizationId: organization.id,
    })
    .returning();

  // Create organization membership
  await db.insert(organizationMemberships)
    .values({
      id: uuidv4(),
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    });

  const userWithOrg = await getUserById(user.id);
  if (!userWithOrg) throw new Error("Failed to create user");

  return userWithOrg;
}

export async function verifyLogin(email: string, password: string): Promise<UserWithOrganization | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      organizationMemberships: true,
      connectionPermissions: true,
    },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) return null;

  // Get the user's organization
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.organizationId),
  });

  if (!org) return null;

  return {
    ...user,
    organization: org,
    currentOrganization: org,
  };
}

export async function getUserById(id: string): Promise<UserWithOrganization | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      organizationMemberships: true,
      connectionPermissions: true,
    },
  });

  if (!user) return null;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.organizationId),
  });

  if (!org) return null;

  return {
    ...user,
    organization: org,
    currentOrganization: org,
  };
}

export async function getUserByEmail(email: string): Promise<UserWithOrganization | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      organizationMemberships: true,
      connectionPermissions: true,
    },
  });

  if (!user) return null;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.organizationId),
  });

  if (!org) return null;

  return {
    ...user,
    organization: org,
    currentOrganization: org,
  };
}

export async function updateUser(userId: string, updates: Partial<typeof users.$inferSelect>): Promise<UserWithOrganization> {
  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  const userWithOrg = await getUserById(updatedUser.id);
  if (!userWithOrg) throw new Error("Failed to update user");

  return userWithOrg;
}

export async function requireUser(request: Request): Promise<UserWithOrganization> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export async function getUserFromSession(request: Request): Promise<UserWithOrganization | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  if (!userId) return null;

  return getUserById(userId);
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "data_studio_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function login(email: string, password: string): Promise<UserWithOrganization | null> {
  const user = await verifyLogin(email, password);
  if (!user) return null;

  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  return user;
}

export async function register(email: string, password: string, name: string): Promise<UserWithOrganization | null> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) return null;

  return createUser(email, password, name);
}
