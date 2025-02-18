import { redirect, useNavigation, useLoaderData, Link } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useParams } from "react-router";
import { requireOrganizationRole } from "../lib/auth/session.server";
import { db } from "../lib/db/db.server";
import { organizationMemberships, Role } from "~/lib/db/schema";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Only admins can invite users
  const data = await requireOrganizationRole(request, "ADMIN");

  return {
    organization: data.organization,
    user: data.user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Only admins can invite users
  await requireOrganizationRole(request, "ADMIN");

  const { orgId } = params;
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;

  if (!email || !role) {
    return { errors: { formErrors: ['Email and role are required'] }, status: 400 };
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      return { errors: { formErrors: ['User not found'] }, status: 404 };
    }

    await db.insert(organizationMemberships).values({
      userId: user.id,
      organizationId: orgId as string,
      role: role.toLowerCase() as Role,
    });

    return redirect(`/organizations/${params.orgId}/members`);
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: {
          formErrors: [error.message],
          fieldErrors: {},
        },
        status: 400
      };
    }
    return {
      errors: {
        errors: {
          formErrors: ["An unexpected error occurred"],
          fieldErrors: {},
        },
      },
      status: 500
    };
  }
}

interface ActionData {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      email?: string[];
      role?: string[];
    };
  };
  status?: number;
}

export default function InviteMember() {
  const { organization } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-center text-foreground mb-8">
            Invite Member to {organization.name}
          </h1>
        </div>

        <div className="bg-card shadow-sm ring-1 ring-border rounded-xl p-6">
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="member@example.com"
                />
              </div>
              {actionData?.errors?.fieldErrors?.email && (
                <div className="pt-1 text-destructive" id="email-error">
                  {actionData.errors.fieldErrors.email[0]}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {actionData?.errors?.fieldErrors?.role && (
                <div className="pt-1 text-destructive" id="role-error">
                  {actionData.errors.fieldErrors.role[0]}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              The invited member will receive an email with instructions to join the organization.
            </p>

            {actionData?.errors?.formErrors && actionData.errors.formErrors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">Error</h3>
                    <div className="mt-2 text-sm text-destructive/90">
                      {actionData.errors.formErrors[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                to=".."
                className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sending Invite..." : "Send Invite"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
