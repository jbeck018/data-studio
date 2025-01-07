import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { connectionManager } from '../lib/db/connection-manager.server';
import { getConnection } from '../lib/connections/config.server';
import { requireUser } from '../lib/auth/session.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    throw new Error("No organization selected");
  }

  const connectionId = params.id;
  if (!connectionId) {
    throw new Error("Connection ID is required");
  }

  try {
    const connection = await getConnection(connectionId, user.currentOrganization.id);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // Get the connection from the connection manager
    const dbConnection = await connectionManager.getConnection(connection.id);
    
    // Test if connection is alive
    const isAlive = await dbConnection.testConnection();
    
    return json({
      status: isAlive ? "connected" : "disconnected",
      error: null
    });
  } catch (error) {
    return json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
