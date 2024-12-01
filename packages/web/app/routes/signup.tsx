import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { createUser } from "~/services/auth.server";
import { createUserSession, getUser } from "~/lib/auth/session.server";

interface SignupFormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface ActionData {
  errors?: {
    email?: string | undefined;
    name?: string | undefined;
    password?: string | undefined;
    signup?: string | undefined;
  };
  fields?: {
    email?: string;
    name?: string;
    password?: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user && user.organizationMemberships?.length > 0) {
    return redirect("/organizations/" + user.organizationMemberships[0].id);
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!email || !name || !password || !confirmPassword || 
      typeof email !== "string" || typeof name !== "string" || 
      typeof password !== "string" || typeof confirmPassword !== "string") {
    return json<ActionData>(
      { 
        errors: { 
          email: !email ? "Email is required" : undefined,
          name: !name ? "Name is required" : undefined,
          password: !password ? "Password is required" : undefined 
        },
        fields: {
          email: email?.toString(),
          name: name?.toString(),
          password: password?.toString()
        }
      },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json<ActionData>(
      { 
        errors: { password: "Passwords do not match" },
        fields: { email, name }
      },
      { status: 400 }
    );
  }

  const existingUser = await getUser(request);
  if (existingUser) {
    return redirect("/");
  }

  try {
    const user = await createUser(email, password);

    return createUserSession({
      request,
      userId: user.id,
      organizationId: undefined,
      remember: false,
      redirectTo: "/organizations/new"
    });
  } catch (error) {
    if (error instanceof Error) {
      return json<ActionData>(
        { 
          errors: { signup: error.message },
          fields: { email, name }
        },
        { status: 400 }
      );
    }
    return json<ActionData>(
      { 
        errors: { signup: "Something went wrong" },
        fields: { email, name }
      },
      { status: 400 }
    );
  }
}

export default function SignUp() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={actionData?.fields?.email}
                aria-invalid={Boolean(actionData?.errors?.email)}
                aria-describedby={actionData?.errors?.email ? "email-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Full name
            </label>
            <div className="mt-1">
              <input
                id="name"
                required
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={actionData?.fields?.name}
                aria-invalid={Boolean(actionData?.errors?.name)}
                aria-describedby={actionData?.errors?.name ? "name-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
              {actionData?.errors?.name && (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.name}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                defaultValue={actionData?.fields?.password}
                aria-invalid={Boolean(actionData?.errors?.password)}
                aria-describedby={actionData?.errors?.password ? "password-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                defaultValue={actionData?.fields?.password}
                aria-invalid={Boolean(actionData?.errors?.password)}
                aria-describedby={actionData?.errors?.password ? "confirm-password-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="confirm-password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          {actionData?.errors?.signup && (
            <div className="pt-1 text-red-700" id="form-error">
              {actionData.errors.signup}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>

          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to="/login"
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
