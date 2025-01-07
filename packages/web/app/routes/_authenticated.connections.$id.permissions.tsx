import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '../lib/db/db.server';
import { requireUser } from '../lib/auth/auth.server';
import { databaseConnections } from '../lib/db/schema';
import { connectionPermissions } from '../lib/db/schema/permissions';
import { users } from '../lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { PermissionManager } from '../components/PermissionManager';
import { permissionsManager, type QueryRestrictions } from '../lib/db/permissions-manager.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { organizationId } = await requireUser(request);
  const connectionId = params.id;

  if (!connectionId) {
    throw new Error('Connection ID is required');
  }

  // Check if user is admin for this connection
  const userPermission = await db.query.connectionPermissions.findFirst({
    where: eq(connectionPermissions.connectionId, connectionId),
    columns: {
      isAdmin: true,
    },
  });

  if (!userPermission?.isAdmin) {
    throw new Error('You do not have permission to manage connection permissions');
  }

  // Get connection details
  const connection = await db.query.databaseConnections.findFirst({
    where: eq(databaseConnections.id, connectionId),
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Get all users in the organization
  const orgUsers = await db.query.users.findMany({
    where: eq(users.organizationId, organizationId),
    columns: {
      id: true,
      email: true,
    },
  });

  // Get all permissions for this connection
  const permissions = await db.query.connectionPermissions.findMany({
    where: eq(connectionPermissions.connectionId, connectionId),
  });

  return {
    connection,
    users: orgUsers,
    permissions: permissions.map(p => ({
      userId: p.userId,
      isAdmin: p.isAdmin,
      canConnect: p.canConnect,
      queryRestrictions: p.queryRestrictions as QueryRestrictions | undefined
    })),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { organizationId } = await requireUser(request);
  const connectionId = params.id;

  if (!connectionId) {
    throw new Error('Connection ID is required');
  }

  // Check if user is admin
  const userPermission = await db.query.connectionPermissions.findFirst({
    where: eq(connectionPermissions.connectionId, connectionId),
    columns: {
      isAdmin: true,
    },
  });

  if (!userPermission?.isAdmin) {
    throw new Error('You do not have permission to manage connection permissions');
  }

  const formData = await request.formData();
  const userId = formData.get('userId') as string;
  const isAdmin = formData.get('isAdmin') === 'true';
  const canConnect = formData.get('canConnect') === 'true';
  const queryRestrictions = JSON.parse(formData.get('queryRestrictions') as string);

  await permissionsManager.setConnectionPermissions(
    connectionId,
    userId,
    organizationId,
    {
      isAdmin,
      canConnect,
      queryRestrictions,
    }
  );

  return { success: true };
}

export default function ConnectionPermissionsPage() {
  const { connection, users, permissions } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Permissions for {connection.name}
        </h1>

        <PermissionManager
          connectionId={connection.id}
          users={users}
          currentPermissions={permissions}
        />
      </div>
    </div>
  );
}
