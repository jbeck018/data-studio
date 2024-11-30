import { db } from "~/lib/db/db.server";
import { organizations, organizationMembers } from "~/lib/db/schema/organizations";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

interface CreateOrganizationInput {
  name: string;
  userId: string;
}

interface UpdateOrganizationInput {
  name?: string;
}

export async function createOrganization({ name, userId }: CreateOrganizationInput) {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${createId().slice(0, 8)}`;

  const [organization] = await db.insert(organizations)
    .values({ name, slug })
    .returning();

  await db.insert(organizationMembers)
    .values({
      organizationId: organization.id,
      userId,
      role: "owner",
    });

  return organization;
}

export async function updateOrganization(id: string, { name }: UpdateOrganizationInput) {
  const [organization] = await db.update(organizations)
    .set({ name, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  return organization;
}

export async function deleteOrganization(id: string) {
  await db.delete(organizations)
    .where(eq(organizations.id, id));
}

export async function getOrganization(id: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.id, id),
    with: {
      members: {
        with: {
          user: true,
        },
      },
    },
  });
}

export async function getUserOrganizations(userId: string) {
  return db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, userId),
    with: {
      organization: true,
    },
  });
}

export async function addOrganizationMember(organizationId: string, userId: string, role: "admin" | "member" = "member") {
  const [member] = await db.insert(organizationMembers)
    .values({ organizationId, userId, role })
    .returning();

  return member;
}

export async function updateOrganizationMemberRole(organizationId: string, userId: string, role: "admin" | "member") {
  const [member] = await db.update(organizationMembers)
    .set({ role, updatedAt: new Date() })
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    )
    .returning();

  return member;
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  await db.delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    );
}

export async function getOrganizationRole(organizationId: string, userId: string) {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId)
    ),
  });

  return member?.role;
}
