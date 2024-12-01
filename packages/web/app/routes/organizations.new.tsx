import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import { createOrganization } from "~/lib/organizations/organizations.server";
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

export async function action({ request }: ActionFunctionArgs) {
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

  return redirect(`/organizations/${organization.id}/connections/new`);
}

export default function NewOrganizationPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Create Your Organization
        </h1>

        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Organization Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={Boolean(actionData?.errors?.fieldErrors?.name)}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.name ? "name-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.name && (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.fieldErrors.name[0]}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Organization URL
            </label>
            <div className="mt-1">
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-500 px-3 text-gray-500 dark:text-gray-400 sm:text-sm">
                  datastudio.io/
                </span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  className="w-full rounded-r border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                  aria-invalid={Boolean(actionData?.errors?.fieldErrors?.slug)}
                  aria-describedby={
                    actionData?.errors?.fieldErrors?.slug ? "slug-error" : undefined
                  }
                />
              </div>
              {actionData?.errors?.fieldErrors?.slug && (
                <div className="pt-1 text-red-700" id="slug-error">
                  {actionData.errors.fieldErrors.slug[0]}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will be your organization's URL. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={Boolean(actionData?.errors?.fieldErrors?.description)}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.description ? "description-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.description && (
                <div className="pt-1 text-red-700" id="description-error">
                  {actionData.errors.fieldErrors.description[0]}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Brief description of your organization.
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
                      {actionData.errors.formErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Organization
          </button>
        </Form>
      </div>
    </div>
  );
}
