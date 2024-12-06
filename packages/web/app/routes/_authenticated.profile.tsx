import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { requireUserId } from "../lib/auth/session.server";
import { updateUser } from "../lib/auth/auth.server";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "New password and confirm password must match",
  path: ["confirmPassword"],
});

interface ActionData {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      name?: string[];
      email?: string[];
      currentPassword?: string[];
      newPassword?: string[];
      confirmPassword?: string[];
    };
  };
  success?: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserId(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  const result = UpdateProfileSchema.safeParse({
    name,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!result.success) {
    return json<ActionData>(
      { errors: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await updateUser(user.id, {
      name: result.data.name,
      email: result.data.email,
      password: result.data.newPassword,
      currentPassword: result.data.currentPassword,
    });

    return json<ActionData>({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return json<ActionData>(
        { errors: { formErrors: [error.message] } },
        { status: 400 }
      );
    }
    return json<ActionData>(
      { errors: { formErrors: ["An unexpected error occurred"] } },
      { status: 500 }
    );
  }
}

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Profile</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Update your personal information and password.
              </p>
            </div>

            <Form method="post" className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-md px-4 py-6 sm:p-8 md:col-span-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={user.name}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.name)}
                      aria-describedby={actionData?.errors?.fieldErrors?.name ? "name-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.name && (
                    <div className="mt-2 text-sm text-red-600" id="name-error">
                      {actionData.errors.fieldErrors.name.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={user.email}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.email)}
                      aria-describedby={actionData?.errors?.fieldErrors?.email ? "email-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.email && (
                    <div className="mt-2 text-sm text-red-600" id="email-error">
                      {actionData.errors.fieldErrors.email.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Current password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.currentPassword)}
                      aria-describedby={actionData?.errors?.fieldErrors?.currentPassword ? "current-password-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.currentPassword && (
                    <div className="mt-2 text-sm text-red-600" id="current-password-error">
                      {actionData.errors.fieldErrors.currentPassword.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    New password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.newPassword)}
                      aria-describedby={actionData?.errors?.fieldErrors?.newPassword ? "new-password-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.newPassword && (
                    <div className="mt-2 text-sm text-red-600" id="new-password-error">
                      {actionData.errors.fieldErrors.newPassword.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Confirm new password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.confirmPassword)}
                      aria-describedby={actionData?.errors?.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.confirmPassword && (
                    <div className="mt-2 text-sm text-red-600" id="confirm-password-error">
                      {actionData.errors.fieldErrors.confirmPassword.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {actionData?.errors?.formErrors && (
                <div className="mt-6 text-sm text-red-600">
                  {actionData.errors.formErrors.join(", ")}
                </div>
              )}

              {actionData?.success && (
                <div className="mt-6 text-sm text-green-600">
                  Profile updated successfully
                </div>
              )}

              <div className="mt-8 flex">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Save changes
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
