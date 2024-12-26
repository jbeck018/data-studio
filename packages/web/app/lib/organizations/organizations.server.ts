import { db } from "../db/db.server";
import { organizations } from "../db/schema/organizations";
import { users } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { Organization } from "../db/schema/organizations";
import type { Role } from "../auth/rbac.server";

export interface OrganizationWithRole extends Organization {
  role: Role;
  currentOrganization: boolean;
}

export async function getOrganizationById(id: string): Promise<OrganizationWithRole | null> {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });

  if (!org) return null;

  return {
    ...org,
    role: "OWNER",
    currentOrganization: false,
  };
}

export async function createOrganization(
  name: string,
  userId: string
): Promise<OrganizationWithRole> {
  const id = uuidv4();

  await db.insert(organizations).values({
    id,
    name,
  });

  await db
    .update(users)
    .set({ organizationId: id })
    .where(eq(users.id, userId));

  return {
    id,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "OWNER",
    currentOrganization: true,
  };
}

export async function getOrganizationsByUserId(
  userId: string
): Promise<OrganizationWithRole[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organization: true,
    },
  });

  if (!user?.organization) return [];

  return [{
    ...user.organization,
    role: "OWNER",
    currentOrganization: true,
  }];
}

export async function updateOrganization(
  id: string,
  data: Partial<OrganizationWithRole>
): Promise<OrganizationWithRole> {
  const { role, currentOrganization, ...orgData } = data;

  const updatedOrg = await db
    .update(organizations)
    .set(orgData)
    .where(eq(organizations.id, id))
    .returning();

  return {
    ...updatedOrg[0],
    role: "OWNER",
    currentOrganization: false,
  };
}

export async function deleteOrganization(id: string): Promise<void> {
  await db.delete(organizations).where(eq(organizations.id, id));
}
