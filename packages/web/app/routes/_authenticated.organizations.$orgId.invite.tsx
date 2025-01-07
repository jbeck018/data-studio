import { json, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { requireOrganizationRole } from "../lib/auth/session.server";
import { db } from "../lib/db/db.server";
import { organizationMemberships, Role } from "~/lib/db/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Only admins can invite users
  await requireOrganizationRole(request, "ADMIN");
  return null;
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Only admins can invite users
  await requireOrganizationRole(request, "ADMIN");

  const { orgId } = params;
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;

  if (!email || !role) {
    return json(
      { errors: { formErrors: ['Email and role are required'] } },
      { status: 400 }
    );
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      return json(
        { errors: { formErrors: ['User not found'] } },
        { status: 404 }
      );
    }

    await db.insert(organizationMemberships).values({
      userId: user.id,
      organizationId: orgId as string,
      role: role.toLowerCase() as Role,
    });

    return redirect(`/organizations/${params.orgId}/members`);
  } catch (error) {
    if (error instanceof Error) {
      return json(
        {
          errors: {
            formErrors: [error.message],
            fieldErrors: {},
          },
        },
        { status: 400 }
      );
    }
    return json(
      {
        errors: {
          formErrors: ["An unexpected error occurred"],
          fieldErrors: {},
        },
      },
      { status: 500 }
    );
  }
}

interface ActionData {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      email?: string;
      role?: string;
    };
  };
  tested?: boolean;
}


export default function InviteUserPage() {
  const actionData = useActionData<ActionData>();
  const params = useParams();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Invite User
        </h1>

        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email Address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={Boolean(actionData?.errors?.fieldErrors?.email)}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.email ? "email-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.fieldErrors.email[0]}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Role
            </label>
            <div className="mt-1">
              <select
                id="role"
                name="role"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={Boolean(actionData?.errors?.fieldErrors?.role)}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.role ? "role-error" : undefined
                }
              >
                <option value="">Select a role</option>
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
              </select>
              {actionData?.errors?.fieldErrors?.role && (
                <div className="pt-1 text-red-700" id="role-error">
                  {actionData.errors.fieldErrors.role[0]}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Admins can manage organization settings and members. Members can only view and query databases.
            </p>
          </div>

          {actionData?.errors?.formErrors && actionData?.errors?.formErrors?.length > 0 && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc space-y-1 pl-5">
                      {actionData?.errors?.formErrors?.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between space-x-4">
            <Button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 rounded border border-gray-500 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Send Invite
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
