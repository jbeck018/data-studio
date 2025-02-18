import { type LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "../lib/auth/session.server";
import { getUserOrganizations } from "../lib/organizations/organizations.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const organizations = await getUserOrganizations(user.id);
  return { organizations };
}

export default function OrganizationsPage() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
        <Link
          to="new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Organization
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => (
          <Link
            key={organization.id}
            to={organization.id}
            className="block p-6 bg-card hover:bg-muted rounded-lg transition-colors"
          >
            <h2 className="text-lg font-medium text-foreground mb-2">{organization.name}</h2>
            <p className="text-sm text-muted-foreground">
              Created {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}

        {organizations.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first organization to get started
            </p>
            <Link
              to="new"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Organization
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
