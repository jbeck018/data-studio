import { json, type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { db } from '~/lib/db/db.server';
import { queryHistory } from '~/lib/db/schema';
import { requireUser } from '~/lib/auth/session.server';
import { eq } from 'drizzle-orm';
import { ConnectionManager } from '~/lib/db/connection-manager.server';

const querySchema = z.object({
  connectionId: z.string(),
  query: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  if (request.method !== 'POST') {
    throw json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { connectionId, query } = querySchema.parse(await request.json());

  // Verify user has access to the connection
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.id, connectionId),
    with: {
      organization: {
        with: {
          members: {
            where: eq(organizationMembers.userId, user.id),
          },
        },
      },
    },
  });

  if (!connection || !connection.organization.members.length) {
    throw json({ error: 'Connection not found' }, { status: 404 });
  }

  // Get the database connection
  const manager = ConnectionManager.getInstance();
  const pool = await manager.getConnection(connectionId);

  // Execute the query
  const startTime = Date.now();
  let result;
  let error;
  let status = 'success';

  try {
    const client = await pool.connect();
    try {
      result = await client.query(query);
    } catch (e) {
      error = e.message;
      status = 'error';
      result = null;
    } finally {
      client.release();
    }
  } catch (e) {
    error = e.message;
    status = 'error';
    result = null;
  }

  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;

  // Record the query in history
  await db.insert(queryHistory).values({
    organizationId: connection.organizationId,
    connectionId,
    userId: user.id,
    query,
    executionTimeMs: executionTimeMs.toString(),
    status,
    error: error || null,
  });

  if (error) {
    throw json({ error }, { status: 400 });
  }

  return json({
    rows: result.rows,
    rowCount: result.rowCount,
    fields: result.fields.map(f => ({
      name: f.name,
      dataTypeId: f.dataTypeID,
    })),
    executionTimeMs,
  });
}
