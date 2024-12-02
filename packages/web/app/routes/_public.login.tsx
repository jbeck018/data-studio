import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { login } from "../lib/auth/auth.server";
import { getUser } from "../lib/auth/session.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

interface LoginActionData {
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  console.log('Login loader - User:', user);

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return redirect("/dashboard");
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('Login action started');
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  const formData = await request.formData();
  console.log('Form data entries:', Object.fromEntries(formData.entries()));
  
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = formData.get('redirectTo') || '/dashboard';

  console.log('Extracted values:', { email, redirectTo });

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    console.log('Invalid form data types');
    return json<LoginActionData>(
      { error: 'Invalid form submission' }, 
      { status: 400 }
    );
  }

  console.log('Calling login function');
  const response = await login(request, formData);
  console.log('Login response type:', response instanceof Response ? 'Response' : 'Object');
  
  // If there are errors, return them
  if ('errors' in response) {
    console.log('Login returned errors:', response.errors);
    return json<LoginActionData>({ error: response.errors.email || 'Login failed' });
  }
  
  // Otherwise, response should be a redirect
  console.log('Login successful, returning redirect response');
  return response;
}

export default function Login() {
  const actionData = useActionData<LoginActionData>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
      
      <div className="mt-8">
        <Form 
          method="post" 
          className="space-y-6"
          encType="application/x-www-form-urlencoded"
        >
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
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{actionData.error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-600">Don't have an account?</span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <Link
              to={{
                pathname: '/register',
                search: searchParams.toString(),
              }}
              className="font-medium text-cyan-600 hover:text-cyan-500"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
