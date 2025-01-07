import { db } from "~/lib/db/db.server";
import { eq } from "drizzle-orm";
import { organizations, organizationMemberships, ROLE_LEVELS } from "~/lib/db/schema";
import type { Role, UserWithOrganization } from "~/lib/db/schema/types";

export async function getUserRole(userId: string, organizationId: string): Promise<Role | null> {
  const membership = await db.query.organizationMemberships.findFirst({
    where: (memberships) => 
      eq(memberships.userId, userId) && 
      eq(memberships.organizationId, organizationId),
  });

  return membership?.role as Role || null;
}

export async function hasRole(user: UserWithOrganization, requiredRole: Role, organizationId: string): Promise<boolean> {
  const membership = user.organizationMemberships?.find(
    (m) => m.organizationId === organizationId
  );

  if (!membership) return false;

  const userRoleLevel = ROLE_LEVELS[membership.role as Role];
  const requiredRoleLevel = ROLE_LEVELS[requiredRole];

  return userRoleLevel >= requiredRoleLevel;
}

export async function getUsersInOrganization(organizationId: string) {
  const members = await db.query.users.findMany({
    where: (users) => eq(users.organizationId, organizationId),
    with: {
      organizationMemberships: true,
      connectionPermissions: true,
    },
  });

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
  });

  if (!org) return [];

  return members.map(member => ({
    ...member,
    organization: org,
    currentOrganization: org,
  }));
}

export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: Role
) {
  const existingMembership = await db.query.organizationMemberships.findFirst({
    where: (memberships) =>
      eq(memberships.userId, userId) &&
      eq(memberships.organizationId, organizationId),
  });

  if (existingMembership) {
    return existingMembership;
  }

  const [membership] = await db
    .insert(organizationMemberships)
    .values({
      userId,
      organizationId,
      role: role || "MEMBER",
    })
    .returning();

  return membership;
}

export async function updateUserRole(
  userId: string,
  organizationId: string,
  newRole: Role
) {
  const [membership] = await db
    .update(organizationMemberships)
    .set({ role: newRole })
    .where(
      eq(organizationMemberships.userId, userId) &&
      eq(organizationMemberships.organizationId, organizationId)
    )
    .returning();

  return membership;
}

export async function removeUserFromOrganization(
  userId: string,
  organizationId: string
) {
  await db
    .delete(organizationMemberships)
    .where(
      eq(organizationMemberships.userId, userId) &&
      eq(organizationMemberships.organizationId, organizationId)
    );
}
