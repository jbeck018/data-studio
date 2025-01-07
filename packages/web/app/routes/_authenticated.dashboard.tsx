import { Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  return {};
}

export default function Index() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome to Data Studio</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/query"
          className="group relative rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base font-semibold leading-7">Run SQL Query</h3>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Write and execute SQL queries with syntax highlighting and autocompletion
          </p>
        </Link>

        <Link
          to="/schema"
          className="group relative rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base font-semibold leading-7">Database Schema</h3>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            View and manage your database schema, tables, and relationships
          </p>
        </Link>

        <Link
          to="/connections"
          className="group relative rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base font-semibold leading-7">Connections</h3>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Manage your database connections and credentials
          </p>
        </Link>
      </div>
    </div>
  );
}
