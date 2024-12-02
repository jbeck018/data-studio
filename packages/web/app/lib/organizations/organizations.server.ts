import { db } from "../../lib/db/db.server";
import { organizations, organizationMembers } from "../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  userId: string;
}

interface UpdateOrganizationInput {
  name: string;
}

interface AddOrganizationMemberInput {
  organizationId: string;
  userId: string;
  role: "admin" | "member";
}

export async function createOrganization({ name, slug, description, userId }: CreateOrganizationInput) {
  const id = createId();

  const [organization] = await db.insert(organizations)
    .values({
      id,
      name,
      slug,
      description,
    })
    .returning();

  // Add the creator as an admin member
  await db.insert(organizationMembers).values({
    userId,
    organizationId: organization.id,
    role: "admin",
  });

  return organization;
}

export async function updateOrganization(id: string, { name }: UpdateOrganizationInput) {
  const [organization] = await db.update(organizations)
    .set({
      name,
    })
    .where(eq(organizations.id, id))
    .returning();

  return organization;
}

export async function deleteOrganization(id: string) {
  // First delete all members
  await db.delete(organizationMembers).where(eq(organizationMembers.organizationId, id));
  
  // Then delete the organization
  await db.delete(organizations).where(eq(organizations.id, id));
}

export async function addOrganizationMember({ organizationId, userId, role }: AddOrganizationMemberInput) {
  const [member] = await db.insert(organizationMembers).values({
    userId,
    organizationId,
    role,
  }).returning();

  return member;
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  await db.delete(organizationMembers).where(
    and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId)
    )
  );
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const userOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      createdAt: organizations.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId));

  return userOrgs;
}

export async function getOrganization(organizationId: string, userId: string): Promise<Organization | undefined> {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      createdAt: organizations.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    );

  return organization;
}

export async function getOrganizationRole(organizationId: string, userId: string): Promise<string | undefined> {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId)
    ),
  });

  return member?.role;
}
