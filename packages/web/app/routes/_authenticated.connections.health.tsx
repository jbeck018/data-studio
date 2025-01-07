import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { db } from '../lib/db/db.server';
import { requireUser } from '../lib/auth/session.server';
import { databaseConnections } from '../lib/db/schema';
import { queryHistory } from '../lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { ConnectionHealthDashboard } from '../components/ConnectionHealthDashboard';
import { connectionManager } from '../lib/db/connection-manager.server';
import type { ConnectionHealth } from '../components/ConnectionHealthDashboard';

async function getConnectionHealth(connectionId: string): Promise<ConnectionHealth | null> {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get connection details
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.id, connectionId),
  });

  if (!connection) return null;

  // Get query history statistics
  const [hourQueries, dayQueries, weekQueries] = await Promise.all([
    db.query.queryHistory.findMany({
      where: and(
        eq(queryHistory.connectionId, connectionId),
        gte(queryHistory.createdAt, hourAgo)
      ),
    }),
    db.query.queryHistory.findMany({
      where: and(
        eq(queryHistory.connectionId, connectionId),
        gte(queryHistory.createdAt, dayAgo)
      ),
    }),
    db.query.queryHistory.findMany({
      where: and(
        eq(queryHistory.connectionId, connectionId),
        gte(queryHistory.createdAt, weekAgo)
      ),
    }),
  ]);

  // Get active connections and health status from connection manager
  const poolStats = await connectionManager.getConnectionStats(connectionId);

  return {
    connectionId,
    name: connection.name,
    type: connection.type,
    status: poolStats.isConnected ? 'healthy' : 'unhealthy',
    activeConnections: poolStats.activeQueries,
    totalQueries: weekQueries.length,
    averageQueryTime: weekQueries.reduce((acc, q) => acc + (Number(q.executionTimeMs) || 0), 0) / weekQueries.length || 0,
    errorCount: weekQueries.filter(q => q.error).length,
    lastHealthCheck: new Date().toISOString(), // Using current time since we just checked
    usageStats: {
      lastHour: hourQueries.length,
      lastDay: dayQueries.length,
      lastWeek: weekQueries.length,
    },
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization?.id) {
    throw new Error("No organization selected");
  }

  const userConnections = await db.query.databaseConnections.findMany({
    where: eq(databaseConnections.organizationId, user.currentOrganization.id),
  });

  const healthData = await Promise.all(
    userConnections.map(conn => getConnectionHealth(conn.id))
  );

  return { connections: healthData.filter((conn): conn is ConnectionHealth => conn !== null) };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization?.id) {
    throw new Error("No organization selected");
  }

  const formData = await request.formData();
  const action = formData.get('action');
  const connectionId = formData.get('connectionId');

  if (!connectionId || typeof connectionId !== 'string') {
    return { error: 'Connection ID is required', status: 400 };
  }

  // Verify user has permission to manage this connection
  const connection = await db.query.databaseConnections.findFirst({
    where: and(
      eq(databaseConnections.id, connectionId),
      eq(databaseConnections.organizationId, user.currentOrganization.id)
    ),
  });

  if (!connection) {
    return { error: 'Connection not found', status: 404 };
  }

  if (action === 'reset') {
    await connectionManager.resetConnection(connectionId);
    return { success: true };
  }

  return { error: 'Invalid action', status: 400 };
}

export default function ConnectionHealthPage() {
  const { connections } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleRefresh = () => {
    submit(null, { method: 'get' });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <ConnectionHealthDashboard
          connections={connections}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
