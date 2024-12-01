import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import { getUserOrganizations } from "~/lib/organizations/organizations.server";

interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const organizations = await getUserOrganizations(user.id);
  return json({ organizations });
}

export default function OrganizationsPage() {
  const { organizations } = useLoaderData<{ organizations: Organization[] }>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Link
          to="/organizations/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Create Organization
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => (
          <Link
            key={organization.id}
            to={`/organizations/${organization.id}`}
            className="block p-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-secondary transition-colors"
          >
            <h2 className="text-lg font-medium mb-2">{organization.name}</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Created {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}

        {organizations.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium mb-2">No organizations yet</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Create your first organization to get started
            </p>
            <Link
              to="/organizations/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Create Organization
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
