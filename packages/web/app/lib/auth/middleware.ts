import { redirect } from "@remix-run/node";
import { getUserFromSession } from "./session.server";
import type { UserWithOrganization } from "~/types";
import type { Role } from "~/lib/db/schema/auth";

const ROLE_LEVELS = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
  VIEWER: 0,
} as const;

export async function requireUser(request: Request): Promise<UserWithOrganization> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export function requireRole(user: UserWithOrganization, requiredRole: Role) {
  const membership = user.organizationMemberships[0];
  if (!membership) {
    throw new Error("User has no organization membership");
  }

  const userRoleLevel = ROLE_LEVELS[membership.role as keyof typeof ROLE_LEVELS];
  const requiredRoleLevel = ROLE_LEVELS[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error("Insufficient permissions");
  }
}

export function requireOwner(user: UserWithOrganization) {
  return requireRole(user, "OWNER");
}

export function requireAdmin(user: UserWithOrganization) {
  return requireRole(user, "ADMIN");
}

export function requireMember(user: UserWithOrganization) {
  return requireRole(user, "MEMBER");
}

export function requireViewer(user: UserWithOrganization) {
  return requireRole(user, "VIEWER");
}
