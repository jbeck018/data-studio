import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import NewConnectionModal from "../components/NewConnectionModal";
import { Button } from "../components/ui/button";
import { requireUser } from "../lib/auth/session.server";
import { ConnectionManager } from "../lib/db/connection-manager.server";
import { db } from "../lib/db/db.server";
import { databaseConnections, NewDatabaseConnection } from "../lib/db/schema";
import { testPostgresConnection } from "../lib/db/test-connection.server";
import { getOrganizationRole } from "../lib/organizations/organizations.server";

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
  const role = await getOrganizationRole(params.orgId || '', user.id);
  
  if (!role) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const connections = await db.query.databaseConnections.findMany({
    where: eq(databaseConnections.organizationId, params.orgId || ''),
  });

  return { connections, role };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const role = await getOrganizationRole(params.orgId || '', user.id);
  
  if (!role || role === "MEMBER") {
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
        return { errors: result.error.flatten(), status: 400 };
      }

      const { name, ...config } = result.data;

      // Test the connection before saving
      try {
        await testPostgresConnection(config);
      } catch (error) {
        return { error: `Failed to connect: ${(error as Record<string, string>).message}`, status: 400 };
      }

      await db.insert(databaseConnections).values(config as unknown as NewDatabaseConnection);

      return null;
    }

    case "delete": {
      const connectionId = formData.get("connectionId");
      if (typeof connectionId !== "string") {
        return { error: "Invalid connection ID", status: 400 };
      }

      // Close the connection if it's active
      await ConnectionManager.getInstance().closeConnection(connectionId);

      // Delete the connection from the database
      await db.delete(databaseConnections)
        .where(eq(databaseConnections.id, connectionId));

      return null;
    }

    case "test": {
      const connectionId = formData.get("connectionId");
      if (typeof connectionId !== "string") {
        return { error: "Invalid connection ID", status: 400 };
      }

      try {
        const pool = await ConnectionManager.getInstance().getConnection(connectionId);
        if (!pool) {
          throw new Error("Could not establish connection");
        }
        const client = await pool.connect();
        await (client as any).release();
        return { success: true };
      } catch (error) {
        return { error: (error as Record<string, string>).message, status: 400 };
      }
    }

    default:
      throw new Response("Invalid intent", { status: 400 });
  }
}

export default function ConnectionsPage() {
  const { connections, role } = useLoaderData<typeof loader>();
  const canManage = role === "OWNER" || role === "ADMIN";
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Database Connections</h1>
          {canManage && (
            <Button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              New Connection
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium mb-1">{connection.name}</h2>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {connection.host}:{connection.port}/{connection.database}
                  </p>
                </div>
                {canManage && (
                  <div className="flex space-x-4">
                    <Form method="post">
                      <input type="hidden" name="intent" value="test" />
                      <input type="hidden" name="connectionId" value={connection.id} />
                      <Button
                        type="submit"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Test Connection
                      </Button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="connectionId" value={connection.id} />
                      <Button
                        type="submit"
                        className="text-red-600 hover:text-red-500"
                        onClick={(e) => {
                          if (!confirm("Are you sure you want to delete this connection?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Form>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {/* <p>Created by {connection.createdBy.name}</p> */}
                <p>Last used: {connection.lastUsedAt ? new Date(connection.lastUsedAt).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          ))}

          {connections.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No database connections</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                Add your first database connection to get started
              </p>
              {canManage && (
                <Button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  New Connection
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <NewConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
