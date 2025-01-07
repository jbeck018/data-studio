import { redirect } from "react-router";
import { requireUser } from "./auth.server";
import { Role, ROLE_LEVELS } from "../db/schema";

export async function requireRole(request: Request, requiredRole: Role) {
  const user = await requireUser(request);

  // Get the highest role from user's organization memberships
  const highestRole = user.organizationMemberships?.reduce((highest: Role, membership) => {
    const currentRoleLevel = ROLE_LEVELS[membership.role as Role];
    const highestRoleLevel = ROLE_LEVELS[highest];
    return (currentRoleLevel > highestRoleLevel ? membership.role : highest) as Role;
  }, "VIEWER" as Role);

  if (!highestRole) {
    throw redirect("/login");
  }

  const requiredRoleLevel = ROLE_LEVELS[requiredRole];
  const userRoleLevel = ROLE_LEVELS[highestRole as Role];

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

