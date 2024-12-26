import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { db } from '../lib/db/db.server';
import { databaseConnections } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUserSession } from '../lib/auth/session.server';

// Key for storing active connection in session
const ACTIVE_CONNECTION_KEY = 'activeConnectionId';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
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
    where: eq(databaseConnections.archived, false),
    orderBy: (connections, { desc }) => [desc(connections.updatedAt)],
  });

  return json({
    connections,
    activeConnection,
  });
}

export type ConnectionState = Awaited<ReturnType<typeof loader>>;
