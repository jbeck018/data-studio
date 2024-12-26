import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "~/lib/db/db.server";
import { users } from "~/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import type { UserWithOrganization } from "~/types";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "DS_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

const USER_SESSION_KEY = "userId";
const ACTIVE_CONNECTION_KEY = "activeConnectionId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return storage.getSession(cookie);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await getSession(request);
  return {
    userId: session.get(USER_SESSION_KEY),
  };
}

export async function getUserFromSession(request: Request): Promise<UserWithOrganization | null> {
  const { userId } = await getUserSession(request);
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organization: true,
      organizationMemberships: true,
    },
  });

  if (!user) return null;

  return user as UserWithOrganization;
}

export async function requireUserId(request: Request): Promise<string> {
  const { userId } = await getUserSession(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}

export async function requireUser(request: Request): Promise<UserWithOrganization> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function setActiveConnection(request: Request, connectionId: string) {
  const session = await getSession(request);
  session.set(ACTIVE_CONNECTION_KEY, connectionId);
  return storage.commitSession(session);
}

export async function getActiveConnection(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get(ACTIVE_CONNECTION_KEY);
}

export const getUser = getUserFromSession;
