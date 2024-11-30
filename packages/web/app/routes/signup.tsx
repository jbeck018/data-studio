import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { createUser, createUserSession, getUserSession, validatePassword } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserSession(request);
  if (user) return redirect("/");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!email || !password || !confirmPassword) {
    return json(
      {
        errors: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          confirmPassword: !confirmPassword ? "Password confirmation is required" : null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
    return json(
      {
        errors: {
          email: typeof email !== "string" ? "Invalid email" : null,
          password: typeof password !== "string" ? "Invalid password" : null,
          confirmPassword: typeof confirmPassword !== "string" ? "Invalid password confirmation" : null,
        },
      },
      { status: 400 }
    );
  }

  const errors = {
    email: null,
    password: null,
    confirmPassword: null,
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = "Invalid email address";
  }

  const passwordError = await validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.values(errors).some(Boolean)) {
    return json({ errors }, { status: 400 });
  }

  try {
    const user = await createUser(email, password);
    return createUserSession({
      request,
      userId: user.id,
      remember: false,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      return json(
        { errors: { email: "A user already exists with this email" } },
        { status: 400 }
      );
    }
    throw error;
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white px-8 pb-8 pt-6 shadow-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-gray-600">Start managing your databases</p>
          </div>

          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                autoFocus={true}
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {actionData?.errors?.email && (
                <div className="mt-1 text-red-600" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {actionData?.errors?.password && (
                <div className="mt-1 text-red-600" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.confirmPassword ? true : undefined}
                aria-describedby="confirmPassword-error"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {actionData?.errors?.confirmPassword && (
                <div className="mt-1 text-red-600" id="confirmPassword-error">
                  {actionData.errors.confirmPassword}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Account
              </button>
            </div>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
