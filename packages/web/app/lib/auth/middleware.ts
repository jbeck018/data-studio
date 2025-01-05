import { redirect } from "@remix-run/node";
import { requireUser } from "./auth.server";
import type { Role } from "~/lib/db/schema/types";
import { ROLE_LEVELS } from "~/lib/db/schema/types";

export async function requireRole(request: Request, requiredRole: Role) {
  const user = await requireUser(request);

  // Get the highest role from user's organization memberships
  const highestRole = user.organizationMemberships?.reduce((highest, membership) => {
    const currentRoleLevel = ROLE_LEVELS[membership.role as Role];
    const highestRoleLevel = ROLE_LEVELS[highest as Role];
    return currentRoleLevel > highestRoleLevel ? membership.role : highest;
  }, "VIEWER" as Role);

  if (!highestRole) {
    throw redirect("/login");
  }

  const requiredRoleLevel = ROLE_LEVELS[requiredRole];
  const userRoleLevel = ROLE_LEVELS[highestRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw redirect("/unauthorized");
  }

  return user;
}

export async function requireAdmin(request: Request) {
  return requireRole(request, "ADMIN");
}

export async function requireOwner(request: Request) {
  return requireRole(request, "OWNER");
}

