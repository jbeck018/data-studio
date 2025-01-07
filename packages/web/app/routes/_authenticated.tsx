import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUser } from "../lib/auth/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import type { User } from "../lib/auth/types";
import { listConnections } from "../lib/connections/config.server";
import type { DatabaseConnection } from "../lib/db/schema";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!user) {
    const url = new URL(request.url);
    return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  // If user has no organizations, redirect to create one
  if (!user.currentOrganization) {
    return redirect("/organizations/new");
  }
  // Get connections for the current organization
  const connections = await listConnections(user.currentOrganization.id);
  return json({ user, connections });
}

export default function AuthenticatedRoot() {
  
  return (
    <AuthenticatedLayout />
  );
}
