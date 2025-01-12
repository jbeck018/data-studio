import { redirect } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { getUser } from "../lib/auth/session.server";
import type { LoaderFunctionArgs } from "react-router";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import type { DatabaseConnection, User } from "../lib/auth/types";
// import { listConnections } from "../lib/connections/config.server";
import { loader as connectionLoader } from "./connections.state";
import Layout from "~/components/Layout";

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
  // const connections = await listConnections(user.currentOrganization.id);
  const connectionState = await connectionLoader({ request, params: {}, context: {} });
  const { connections, activeConnection } = connectionState;
  return { user, connections, activeConnection };
}

type LoaderData = {
  user: User;
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
};

export default function AuthenticatedRoot() {
  const { user, connections, activeConnection } = useLoaderData<LoaderData>();
  
  return (
    <Layout connections={connections as DatabaseConnection[]} activeConnection={activeConnection as DatabaseConnection | null}>
      <Outlet />
    </Layout>
  );
}
