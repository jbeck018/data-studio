import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { getOrganizationRole } from "../lib/organizations/organizations.server";
import { db } from "../lib/db/db.server";
import { databaseConnections } from "../lib/db/schema/connections";
import { eq } from "drizzle-orm";
import { ConnectionManager } from "../lib/db/connection-manager.server";
import { z } from "zod";
import { useState } from "react";
import NewConnectionModal from "../components/NewConnectionModal";
import { testPostgresConnection } from "../lib/db/test-connection.server";

const ConnectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().int().min(1).max(65535),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const role = await getOrganizationRole(params.orgId!, user.id);
  
  if (!role) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const connections = await db.query.databaseConnections.findMany({
    where: eq(databaseConnections.organizationId, params.orgId!),
  });

  return json({ connections, role });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const role = await getOrganizationRole(params.orgId!, user.id);
  
  if (!role || role === "member") {
    throw new Response("Unauthorized", { status: 403 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const result = ConnectionSchema.safeParse({
        name: formData.get("name"),
        host: formData.get("host"),
        port: formData.get("port"),
        database: formData.get("database"),
        username: formData.get("username"),
        password: formData.get("password"),
        ssl: formData.get("ssl") === "true",
      });

      if (!result.success) {
        return json(
          { errors: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      try {
        await testPostgresConnection(result.data);
      } catch (error) {
        return json(
          {
            errors: {
              _form: ["Failed to connect to database. Please check your credentials."],
            },
          },
          { status: 400 }
        );
      }

      await db.insert(databaseConnections).values({
        ...result.data,
        organizationId: params.orgId!,
        userId: user.id,
      });

      return json({ success: true });
    }
    case "delete": {
      const connectionId = formData.get("connectionId");
      if (!connectionId || typeof connectionId !== "string") {
        return json({ error: "Connection ID is required" }, { status: 400 });
      }

      await db
        .delete(databaseConnections)
        .where(eq(databaseConnections.id, connectionId));

      ConnectionManager.getInstance().removeConnection(connectionId);

      return json({ success: true });
    }
    default:
      return json({ error: "Invalid intent" }, { status: 400 });
  }
}

export default function ConnectionsPage() {
  const { connections, role } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Database Connections</h1>
        {role !== "member" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            New Connection
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-medium">{connection.name}</h2>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {connection.host}:{connection.port}
                </p>
              </div>
              {role !== "member" && (
                <Form method="post">
                  <input type="hidden" name="connectionId" value={connection.id} />
                  <button
                    type="submit"
                    name="intent"
                    value="delete"
                    className="text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </Form>
              )}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <p>Database: {connection.database}</p>
              <p>Username: {connection.username}</p>
              <p>SSL: {connection.ssl ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        ))}

        {connections.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium mb-2">No connections yet</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Add your first database connection to get started
            </p>
            {role !== "member" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                New Connection
              </button>
            )}
          </div>
        )}
      </div>

      <NewConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
