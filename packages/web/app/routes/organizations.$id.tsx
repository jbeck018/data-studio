import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import {
  getOrganization,
  getOrganizationRole,
  updateOrganization,
  deleteOrganization,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
} from "~/lib/organizations/organizations.server";
import { z } from "zod";

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

const AddMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const organization = await getOrganization(params.id!);
  
  if (!organization) {
    throw new Response("Not Found", { status: 404 });
  }

  const role = await getOrganizationRole(organization.id, user.id);
  if (!role) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return json({ organization, role });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const organization = await getOrganization(params.id!);
  if (!organization) {
    throw new Response("Not Found", { status: 404 });
  }

  const role = await getOrganizationRole(organization.id, user.id);
  if (!role || role === "member") {
    throw new Response("Unauthorized", { status: 403 });
  }

  switch (intent) {
    case "update": {
      if (role !== "owner") {
        throw new Response("Unauthorized", { status: 403 });
      }

      const name = formData.get("name");
      const result = UpdateOrganizationSchema.safeParse({ name });
      if (!result.success) {
        return json({ errors: result.error.flatten() }, { status: 400 });
      }

      await updateOrganization(organization.id, { name: result.data.name });
      return null;
    }

    case "delete": {
      if (role !== "owner") {
        throw new Response("Unauthorized", { status: 403 });
      }

      await deleteOrganization(organization.id);
      return redirect("/organizations");
    }

    case "add-member": {
      const result = AddMemberSchema.safeParse({
        email: formData.get("email"),
        role: formData.get("role"),
      });

      if (!result.success) {
        return json({ errors: result.error.flatten() }, { status: 400 });
      }

      // TODO: Look up user by email and add them to the organization
      return null;
    }

    case "update-role": {
      if (role !== "owner") {
        throw new Response("Unauthorized", { status: 403 });
      }

      const memberId = formData.get("memberId");
      const newRole = formData.get("role");

      if (typeof memberId !== "string" || !["admin", "member"].includes(newRole as string)) {
        return json({ error: "Invalid input" }, { status: 400 });
      }

      await updateOrganizationMemberRole(organization.id, memberId, newRole as "admin" | "member");
      return null;
    }

    case "remove-member": {
      if (role !== "owner") {
        throw new Response("Unauthorized", { status: 403 });
      }

      const memberId = formData.get("memberId");
      if (typeof memberId !== "string") {
        return json({ error: "Invalid input" }, { status: 400 });
      }

      await removeOrganizationMember(organization.id, memberId);
      return null;
    }

    default:
      throw new Response("Invalid intent", { status: 400 });
  }
}

export default function OrganizationPage() {
  const { organization, role } = useLoaderData<typeof loader>();
  const isOwner = role === "owner";

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{organization.name}</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Created {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </div>

          {isOwner && (
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to delete this organization?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete Organization
              </button>
            </Form>
          )}
        </div>

        <div className="space-y-8">
          {/* Organization Settings */}
          {isOwner && (
            <section className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Organization Settings</h2>
              <Form method="post" className="max-w-md space-y-4">
                <input type="hidden" name="intent" value="update" />
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={organization.name}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            </section>
          )}

          {/* Members List */}
          <section className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Members</h2>
            <div className="space-y-4">
              {organization.members?.map(({ user: member, role: memberRole }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize">
                      {memberRole}
                    </span>
                    {isOwner && member.id !== user.id && (
                      <Form method="post" className="flex items-center space-x-2">
                        <input type="hidden" name="intent" value="remove-member" />
                        <input type="hidden" name="memberId" value={member.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-500"
                          onClick={(e) => {
                            if (!confirm("Are you sure you want to remove this member?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Remove
                        </button>
                      </Form>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Form */}
            {(isOwner || role === "admin") && (
              <Form method="post" className="mt-6 max-w-md space-y-4">
                <input type="hidden" name="intent" value="add-member" />
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Add Member by Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="member"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </Form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
