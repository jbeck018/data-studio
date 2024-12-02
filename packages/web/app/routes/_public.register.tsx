import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { register } from "../lib/auth/auth.server";

interface ActionErrors {
  email?: string;
  password?: string;
  name?: string;
  signup?: string;
}

interface ActionData {
  errors?: ActionErrors;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const name = formData.get('name');
  const redirectTo = formData.get('redirectTo') || '/';

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string' ||
    typeof name !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return json<ActionData>({ 
      errors: { signup: 'Invalid form submission' } 
    }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json<ActionData>({ 
      errors: { password: 'Passwords do not match' } 
    });
  }

  return register(request, formData);
}

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Create your account
      </h2>
      
      <div className="mt-8">
        <Form method="post" className="space-y-6">
          <input 
            type="hidden" 
            name="redirectTo" 
            value={redirectTo} 
          />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
              {actionData && actionData.errors?.email && (
                <p className="mt-2 text-sm text-red-600">{actionData.errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
              {actionData?.errors?.name && (
                <p className="mt-2 text-sm text-red-600">{actionData.errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
              {actionData?.errors?.password && (
                <p className="mt-2 text-sm text-red-600">{actionData.errors.password}</p>
              )}
            </div>
          </div>

          {actionData?.errors?.signup && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{actionData.errors.signup}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Sign up
            </button>
          </div>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-600">Already have an account?</span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <Link
              to={{
                pathname: '/login',
                search: searchParams.toString(),
              }}
              className="font-medium text-cyan-600 hover:text-cyan-500"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
