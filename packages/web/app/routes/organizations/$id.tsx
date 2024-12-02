import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "../../lib/auth/session.server";
import { getOrganization } from "../../lib/organizations/organizations.server";
import { z } from "zod";

const ParamsSchema = z.object({
  id: z.string().uuid()
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  const result = ParamsSchema.safeParse(params);
  if (!result.success) {
    throw new Response("Invalid organization ID", { status: 400 });
  }

  const organization = await getOrganization(result.data.id, user.id);
  if (!organization) {
    throw new Response("Organization not found", { status: 404 });
  }

  return json({ organization });
}

export default function OrganizationPage() {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{organization.name}</h1>
      </div>

      <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Organization Details</h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Created {new Date(organization.createdAt).toLocaleDateString()}
          </p>
        </div>
        {organization.description && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Description</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {organization.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
