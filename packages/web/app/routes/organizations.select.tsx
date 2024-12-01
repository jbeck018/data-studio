import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import { db } from "~/lib/db/db.server";
import { organizations, organizationMembers } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { setCurrentOrganization } from "~/lib/auth/session.server";

interface LoaderData {
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface ActionData {
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  // If user already has a current organization, redirect to it
  if (user.currentOrganization) {
    return redirect(`/organizations/${user.currentOrganization}`);
  }

  // Get all organizations the user is a member of
  const userOrgs = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
    with: {
      organization: true,
    },
  });

  return json<LoaderData>({
    organizations: userOrgs.map((org) => ({
      id: org.organizationId,
      name: org.organization.name,
      role: org.role,
    })),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const organizationId = formData.get("organizationId") as string;

  if (!organizationId) {
    return json<ActionData>({ error: "Organization ID is required" }, { status: 400 });
  }

  // Verify user is a member of the organization
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id),
    columns: {
      role: true,
    },
  });

  if (!membership) {
    return json<ActionData>({ error: "You are not a member of this organization" }, { status: 403 });
  }

  return setCurrentOrganization(request, organizationId);
}

export default function SelectOrganization() {
  const { organizations } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Select Organization
        </h2>

        <div className="mt-8 space-y-4">
          {organizations.map((org) => (
            <Form key={org.id} method="post" className="space-y-4">
              <input type="hidden" name="organizationId" value={org.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role: {org.role.toLowerCase()}
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
            </Form>
          ))}

          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {actionData.error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Want to create a new organization?{" "}
              <Link
                className="text-blue-500 underline"
                to="/organizations/new"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
