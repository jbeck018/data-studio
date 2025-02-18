import { Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  
  if (!user) {
    return redirect("/login");
  }

  // If user has no connections, redirect to create one
  if (!user.databaseConnections || user.databaseConnections.length === 0) {
    return redirect("/connections/new");
  }

  return { user };
}

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Welcome to Data Studio</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/query"
          className="group relative rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:bg-muted"
        >
          <h3 className="text-base font-semibold leading-7 text-foreground">Run SQL Query</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Write and execute SQL queries against your databases
          </p>
        </Link>

        <Link
          to="/schema"
          className="group relative rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:bg-muted"
        >
          <h3 className="text-base font-semibold leading-7 text-foreground">Database Schema</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            View and explore your database schema
          </p>
        </Link>

        <Link
          to="/connections"
          className="group relative rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:bg-muted"
        >
          <h3 className="text-base font-semibold leading-7 text-foreground">Connections</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your database connections
          </p>
        </Link>
      </div>
    </div>
  );
}
