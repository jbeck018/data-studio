import { redirect } from 'react-router';
import { db } from '../../lib/db/db.server';
import { databaseConnections } from '../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function requireConnection(
  request: Request,
  organizationId: string,
  redirectTo: string = new URL(request.url).pathname,
) {
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.organizationId, organizationId),
  });

  if (!connection) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/connection/new?${searchParams}`);
  }

  return connection;
}

export async function hasConnection(organizationId: string): Promise<boolean> {
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.organizationId, organizationId),
  });

  return !!connection;
}
