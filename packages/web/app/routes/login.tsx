import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { verifyLogin } from "~/services/auth.server";
import { createUserSession, getUser } from "~/lib/auth/session.server";

interface LoginFormData {
  email: string;
  password: string;
  remember: string;
}

interface ActionData {
  errors?: {
    email?: string | undefined;
    password?: string | undefined;
    login?: string | undefined;
  };
  fields?: {
    email?: string;
    password?: string;
    remember?: boolean;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    // If user has organizations, redirect to org selection or first org
    if (user.organizationMemberships.length > 0) {
      if (user.currentOrganization) {
        return redirect(`/organizations/${user.currentOrganization}`);
      }
      return redirect('/organizations/select');
    }
    // If no organizations, redirect to create first org
    return redirect('/organizations/new');
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember");

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return json<ActionData>(
      { 
        errors: { 
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined
        },
        fields: {
          email: email?.toString(),
          password: password?.toString(),
          remember: remember === "on"
        }
      },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { 
        errors: { login: "Invalid email or password" },
        fields: {
          email,
          password,
          remember: remember === "on"
        }
      },
      { status: 400 }
    );
  }

  // If they have organizations, redirect to the first one
  if (user.organizationMemberships.length > 0) {
    return createUserSession({
      request,
      userId: user.id,
      organizationId: user.organizationMemberships[0].id,
      remember: remember === "on",
      redirectTo: `/organizations/${user.organizationMemberships[0].id}`
    });
  }

  // Otherwise redirect to create a new organization
  return createUserSession({
    request,
    userId: user.id,
    organizationId: undefined,
    remember: remember === "on",
    redirectTo: "/organizations/new"
  });
}

export default function Login() {
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
                aria-invalid={Boolean(actionData?.errors?.email)}
                aria-describedby={actionData?.errors?.email ? "email-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
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
                autoComplete="current-password"
                aria-invalid={Boolean(actionData?.errors?.password)}
                aria-describedby={actionData?.errors?.password ? "password-error" : undefined}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="remember"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Remember me
            </label>
            <div className="mt-1">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                defaultValue="on"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {actionData?.errors?.email && (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.email}
            </div>
          )}
          {actionData?.errors?.password && (
            <div className="pt-1 text-red-700" id="password-error">
              {actionData.errors.password}
            </div>
          )}
          {actionData?.errors?.login && (
            <div className="pt-1 text-red-700" id="form-error">
              {actionData.errors.login}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>

          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to="/signup"
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
