import { redirect } from '@remix-run/node';
import { db } from '../../lib/db/db.server';
import { databaseConnections } from '../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function requireConnection(
  request: Request,
  organizationId: string,
  redirectTo: string = new URL(request.url).pathname,
) {
  const connection = await db.query.databaseConnections.findFirst({
    where: and(
      eq(databaseConnections.organizationId, organizationId),
      eq(databaseConnections.archived, false),
    ),
  });

  if (!connection) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/connection/new?${searchParams}`);
  }

  return connection;
}

export async function hasConnection(organizationId: string): Promise<boolean> {
  const connection = await db.query.databaseConnections.findFirst({
    where: and(
      eq(databaseConnections.organizationId, organizationId),
      eq(databaseConnections.archived, false),
    ),
    columns: {
      id: true,
    },
  });

  return !!connection;
}
