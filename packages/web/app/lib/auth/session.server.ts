import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "~/lib/db/db.server";
import { eq } from "drizzle-orm";
import type { UserWithOrganization } from "~/lib/db/schema/types";
import { getUserById } from "./auth.server";
import { organizations } from "../db/schema";

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

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserFromSession(
  request: Request
): Promise<UserWithOrganization | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) return null;

  const user = await getUserById(userId);
  if (!user) return null;

  return user;
}

export async function requireUserSession(
  request: Request
): Promise<UserWithOrganization> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function destroyUserSession(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function setCurrentOrganization(
  request: Request,
  organizationId: string
) {
  const user = await getUserFromSession(request);
  if (!user) throw redirect("/login");

  const membership = user.organizationMemberships?.find(
    (m) => m.organizationId === organizationId
  );
  if (!membership) throw redirect("/organizations");

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
  });
  if (!org) throw redirect("/organizations");

  const session = await getUserSession(request);
  session.set("currentOrganizationId", organizationId);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export const requireUser = requireUserSession;
export const getUser = getUserFromSession;
export const requireUserId = async (request: Request): Promise<string> => {
  const user = await requireUserSession(request);
  return user.id;
};

export const requireOrganizationRole = async (request: Request, organizationId: string) => {
  const user = await requireUserSession(request);
  const membership = user.organizationMemberships?.find(
    (m) => m.organizationId === organizationId
  );
  if (!membership) throw redirect("/organizations");
  return membership;
};

export const requireOrganization = requireOrganizationRole;

export const setActiveConnection = async (
  request: Request,
  connectionId: string
) => {
  const session = await getUserSession(request);
  session.set("activeConnectionId", connectionId);
  return redirect("/query", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const getSession = getUserSession;

