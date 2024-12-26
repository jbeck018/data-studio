import { db } from "~/lib/db/db.server";
import { users, organizations, organizationMemberships } from "~/lib/db/schema/auth";
import { eq, and } from "drizzle-orm";
import type { UserWithOrganization } from "~/types";
import type { Role } from "~/lib/db/schema/auth";

const ROLE_LEVELS = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
  VIEWER: 0,
} as const;

type Role = keyof typeof ROLE_LEVELS;

export function hasPermission(user: UserWithOrganization, requiredRole: Role): boolean {
  const membership = user.organizationMemberships[0];
  if (!membership) return false;

  const userRoleLevel = ROLE_LEVELS[membership.role as keyof typeof ROLE_LEVELS];
  const requiredRoleLevel = ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS];

  return userRoleLevel >= requiredRoleLevel;
}

export async function getUsersInOrganization(organizationId: string): Promise<UserWithOrganization[]> {
  const usersWithOrg = await db.query.users.findMany({
    where: eq(users.organizationId, organizationId),
    with: {
      organization: true,
      organizationMemberships: true,
    },
  });

  return usersWithOrg as UserWithOrganization[];
}

export async function updateUserRole(userId: string, organizationId: string, role: Role) {
  await db
    .update(organizationMemberships)
    .set({ role })
    .where(
      and(
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.organizationId, organizationId)
      )
    );

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organization: true,
      organizationMemberships: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user as UserWithOrganization;
}

export async function removeUserFromOrganization(userId: string, organizationId: string) {
  await db
    .delete(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.organizationId, organizationId)
      )
    );
}
