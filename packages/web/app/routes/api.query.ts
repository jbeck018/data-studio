import { requireUser } from '../lib/auth/session.server';
import { db } from '../lib/db/db.server';
import { databaseConnections } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import type { QueryResult } from '~/types';
import { ConnectionManager } from '../lib/db/connection-manager.server';

const connectionManager = ConnectionManager.getInstance();

export async function executeQuery(connectionId: string, sql: string): Promise<QueryResult> {
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.id, connectionId),
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  return connectionManager.validateAndExecuteQuery(connectionId, sql);
}
