import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUser } from "../lib/auth/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import type { User } from "../lib/auth/types";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('Checking authentication');
  const user = await getUser(request);
  console.log('User from getUser:', user);

  if (!user) {
    console.log('No user found, redirecting to login');
    const url = new URL(request.url);
    return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  // If user has no organizations, redirect to create one
  if (user.organizations.length === 0) {
    console.log('No organizations, redirecting to create one');
    return redirect("/organizations/new");
  }

  // If user has no active database connection in their current organization
  if (!user.hasConnection) {
    console.log('No active connection, redirecting to create one');
    return redirect("/connections/new");
  }

  console.log('Authentication successful, returning user data');
  return json({ user });
}

export default function AuthenticatedRoot() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <AuthenticatedLayout user={user as unknown as User}>
      <Outlet />
    </AuthenticatedLayout>
  );
}
