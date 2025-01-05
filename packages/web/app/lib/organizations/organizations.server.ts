import { db } from "../db/db.server";
import { organizations, organizationMemberships } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Organization, OrganizationWithRole, OrganizationMembership, Role } from "../db/schema/auth";

export async function getOrganizationById(id: string): Promise<OrganizationWithRole | null> {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
    with: {
      members: {
        with: {
          user: true
        }
      }
    }
  });

  if (!org) return null;

  // Get the first member's role as the organization role (usually the owner)
  const firstMember = org.members?.[0];
  const role = firstMember?.role as Role || 'MEMBER';

  return {
    ...org,
    role,
    members: org.members
  };
}

export async function getUserOrganizations(userId: string): Promise<OrganizationWithRole[]> {
  const memberships = await db.query.organizationMemberships.findMany({
    where: eq(organizationMemberships.userId, userId),
    with: {
      organization: true
    }
  });
  
  return memberships.map(membership => ({
    ...membership.organization,
    role: membership.role as Role,
    members: []
  }));
}

export async function createOrganization(
  name: string,
  userId: string
): Promise<Organization> {
  const [organization] = await db
    .insert(organizations)
    .values({
      name,
      createdById: userId,
    })
    .returning();

  await db.insert(organizationMemberships).values({
    organizationId: organization.id,
    userId,
    role: "OWNER" as Role,
  });

  return organization;
}

export async function getOrganizationRole(
  organizationId: string,
  userId: string
): Promise<Role | null> {
  const membership = await db.query.organizationMemberships.findFirst({
    where: eq(organizationMemberships.organizationId, organizationId),
    columns: {
      role: true
    }
  });
  
  return membership?.role as Role || null;
}

export const getOrganization = getOrganizationById;
