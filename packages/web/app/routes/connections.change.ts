import { ActionFunctionArgs, json } from "@remix-run/node";
import { requireUser, getUserSession, sessionStorage } from "../lib/auth/session.server";
import { getConnection } from "../lib/connections/config.server";
import { connectionManager } from "../lib/db/connection-manager.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    throw new Error("No organization selected");
  }

  const formData = await request.formData();
  const connectionId = formData.get('connectionId') as string;

  if (!connectionId) {
    return json({ error: 'Connection ID is required' }, { status: 400 });
  }

  try {
    // Get connection details
    const connection = await getConnection(connectionId, user.currentOrganization);
    if (!connection) {
      return json({ error: 'Connection not found' }, { status: 404 });
    }

    // Test the connection before switching
    const dbConnection = await connectionManager.getConnection(connection);
    const isAlive = await dbConnection.testConnection();

    if (!isAlive) {
      return json({ error: "Connection is not available" }, { status: 400 });
    }

    // Update the session with the new active connection
    const session = await getUserSession(request);
    session.set('activeConnectionId', connectionId);

    // Initialize the connection
    await connectionManager.connect(connection);

    return json(
      { success: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  } catch (error) {
    console.error("Failed to change connection:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to change connection" },
      { status: 500 }
    );
  }
}
