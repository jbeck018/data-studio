import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireOrganizationRole } from "../lib/auth/session.server";
import { db } from "../lib/db/db.server";
import { organizationMemberships } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "../lib/utils";

interface LoaderData {
  members: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
  isAdmin: boolean;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!params.orgId) {
    throw new Error("Organization ID is required");
  }

  const membership = await requireOrganizationRole(request, params.orgId);

  // Get all members of the organization
  const members = await db.query.organizationMemberships.findMany({
    where: eq(organizationMemberships.organizationId, params.orgId),
    with: {
      user: true,
    },
    orderBy: (members, { desc }) => [desc(members.createdAt)],
  });

  return {
    members: members.map((member) => ({
      id: member.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      joinedAt: member.createdAt.toISOString(),
    })),
    organization: membership.organization,
    isAdmin: membership.membership.role === "ADMIN" || membership.membership.role === "OWNER",
  };
}

export default function OrganizationMembers() {
  const { organization, members, isAdmin } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">
            {organization.name} Members
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage members and their roles in your organization
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="invite"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Invite Member
          </Link>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-muted-foreground sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {member.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          member.role === "OWNER" 
                            ? "bg-primary/10 text-primary ring-primary/30"
                            : member.role === "ADMIN"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/30 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30"
                            : "bg-muted text-muted-foreground ring-border"
                        )}>
                          {member.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
