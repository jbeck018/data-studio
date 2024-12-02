import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { requireUser } from "../../lib/auth/session.server";
import { createOrganization } from "../../lib/organizations/organizations.server";
import { z } from "zod";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
});

export type ActionData = {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      name?: string[];
      slug?: string[];
      description?: string[];
    };
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  // This will redirect to login if user is not authenticated
  await requireUser(request);
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const name = formData.get("name");
    const slug = formData.get("slug");
    const description = formData.get("description");

    const result = CreateOrganizationSchema.safeParse({ name, slug, description });
    if (!result.success) {
      return json<ActionData>({ errors: result.error.flatten() }, { status: 400 });
    }

    const organization = await createOrganization({
      name: result.data.name,
      slug: result.data.slug,
      description: result.data.description,
      userId: user.id,
    });

    return redirect(`/organizations/${organization.id}`);
  } catch (error) {
    console.error('Error creating organization:', error);
    return json<ActionData>({
      errors: {
        formErrors: ['Failed to create organization. Please try again.']
      }
    }, { status: 500 });
  }
}

export default function NewOrganizationPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create Organization</h1>

      <Form method="post" className="space-y-6">
        {actionData?.errors?.formErrors ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">
                {actionData.errors.formErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-secondary dark:border-dark-border"
            required
          />
          {actionData?.errors?.fieldErrors?.name ? (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.fieldErrors.name.join(", ")}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Slug
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="slug"
              id="slug"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-secondary dark:border-dark-border"
              required
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens are allowed"
            />
          </div>
          {actionData?.errors?.fieldErrors?.slug ? (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.fieldErrors.slug.join(", ")}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-secondary dark:border-dark-border"
          />
          {actionData?.errors?.fieldErrors?.description ? (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.fieldErrors.description.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
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
