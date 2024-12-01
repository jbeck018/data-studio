import { redirect } from '@remix-run/node';
import { db } from '~/lib/db/db.server';
import { organizationMembers } from '~/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

export enum Permission {
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  MANAGE_CONNECTIONS = 'MANAGE_CONNECTIONS',
  MANAGE_QUERIES = 'MANAGE_QUERIES',
  RUN_QUERIES = 'RUN_QUERIES',
  VIEW_QUERIES = 'VIEW_QUERIES',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: Object.values(Permission),
  [Role.ADMIN]: Object.values(Permission),
  [Role.MEMBER]: [
    Permission.MANAGE_CONNECTIONS,
    Permission.MANAGE_QUERIES,
    Permission.RUN_QUERIES,
    Permission.VIEW_QUERIES,
  ],
};

export async function getUserOrganizationRole(
  userId: string,
  organizationId: string,
): Promise<Role | null> {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
    ),
    columns: {
      role: true,
    },
  });

  return member?.role as Role || null;
}

export async function getUserOrganizationPermissions(
  userId: string,
  organizationId: string,
): Promise<Permission[]> {
  const role = await getUserOrganizationRole(userId, organizationId);
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}

export async function requireOrganizationPermission(
  request: Request,
  userId: string,
  organizationId: string,
  requiredPermission: Permission,
  redirectTo: string = '/',
) {
  const permissions = await getUserOrganizationPermissions(userId, organizationId);
  
  if (!permissions.includes(requiredPermission)) {
    throw redirect(redirectTo, {
      status: 403,
    });
  }
}

export async function hasOrganizationPermission(
  userId: string,
  organizationId: string,
  permission: Permission,
): Promise<boolean> {
  const permissions = await getUserOrganizationPermissions(userId, organizationId);
  return permissions.includes(permission);
}

export async function assignOrganizationRole(
  userId: string,
  organizationId: string,
  role: Role,
) {
  await db.insert(organizationMembers)
    .values({
      userId,
      organizationId,
      role,
    })
    .onConflictDoUpdate({
      target: [organizationMembers.userId, organizationMembers.organizationId],
      set: { role },
    });
}

export async function removeFromOrganization(
  userId: string,
  organizationId: string,
) {
  await db.delete(organizationMembers)
    .where(and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
    ));
}
