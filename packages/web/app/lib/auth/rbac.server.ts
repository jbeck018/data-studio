import { redirect } from '@remix-run/node';
import { db } from '../db/db.server';
import { organizationMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export type Role = 'owner' | 'admin' | 'member';

export enum Permission {
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  MANAGE_CONNECTIONS = 'MANAGE_CONNECTIONS',
  VIEW_CONNECTIONS = 'VIEW_CONNECTIONS',
  EXECUTE_QUERIES = 'EXECUTE_QUERIES',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    Permission.MANAGE_ORGANIZATION,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_CONNECTIONS,
    Permission.VIEW_CONNECTIONS,
    Permission.EXECUTE_QUERIES,
  ],
  admin: [
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_CONNECTIONS,
    Permission.VIEW_CONNECTIONS,
    Permission.EXECUTE_QUERIES,
  ],
  member: [
    Permission.VIEW_CONNECTIONS,
    Permission.EXECUTE_QUERIES,
  ],
};

export async function getUserOrganizationRole(userId: string, organizationId: string): Promise<Role | null> {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId)
    ),
  });

  return member?.role ?? null;
}

export async function getUserOrganizationPermissions(userId: string, organizationId: string): Promise<Permission[]> {
  const role = await getUserOrganizationRole(userId, organizationId);
  if (!role) return [];
  return ROLE_PERMISSIONS[role];
}

export async function requirePermission(userId: string, organizationId: string, permission: Permission) {
  const permissions = await getUserOrganizationPermissions(userId, organizationId);
  if (!permissions.includes(permission)) {
    throw redirect('/unauthorized');
  }
}

export async function createOrganizationMember(userId: string, organizationId: string, role: Role) {
  await db.insert(organizationMembers).values({
    userId,
    organizationId,
    role,
  });
}

export async function updateOrganizationMemberRole(userId: string, organizationId: string, role: Role) {
  await db.update(organizationMembers)
    .set({ role })
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );
}
