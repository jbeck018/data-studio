import type { LoaderFunctionArgs } from 'react-router';
import { db } from '../lib/db/db.server';
import { databaseConnections } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser, getUserSession } from '../lib/auth/session.server';

// Key for storing active connection in session
const ACTIVE_CONNECTION_KEY = 'activeConnectionId';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  const user = await getUser(request);
  const activeConnectionId = session.get(ACTIVE_CONNECTION_KEY);

  // Get active connection details if exists
  let activeConnection = null;
  if (activeConnectionId) {
    activeConnection = await db.query.databaseConnections.findFirst({
      where: eq(databaseConnections.id, activeConnectionId),
    });
  }

  // Get all available connections
  const connections = await db.query.databaseConnections.findMany({
    orderBy: (connections, { desc }) => [desc(connections.updatedAt)],
  });

  return {
    connections,
    activeConnection,
  };
}

export type ConnectionState = Awaited<ReturnType<typeof loader>>;
