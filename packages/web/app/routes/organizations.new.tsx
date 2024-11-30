import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import { createOrganization } from "~/lib/organizations/organizations.server";
import { z } from "zod";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const name = formData.get("name");

  const result = CreateOrganizationSchema.safeParse({ name });
  if (!result.success) {
    return json({ errors: result.error.flatten() }, { status: 400 });
  }

  const organization = await createOrganization({
    name: result.data.name,
    userId: user.id,
  });

  return redirect(`/organizations/${organization.id}`);
}

export default function NewOrganizationPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create Organization</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <a
            href="/organizations"
            className="px-4 py-2 text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Create Organization
          </button>
        </div>
      </Form>
    </div>
  );
}
