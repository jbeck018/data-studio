import { json, type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { db } from '../lib/db/db.server';
import { databaseConnections } from '../lib/db/schema';
import { requireUser } from '../lib/auth/session.server';
import { eq } from 'drizzle-orm';
import { ConnectionManager } from '../lib/db/connection-manager.server';

const connectionSchema = z.object({
  name: z.string().min(1),
  type: z.literal('postgresql'),
  credentials: z.object({
    host: z.string(),
    port: z.number(),
    database: z.string(),
    user: z.string(),
    password: z.string(),
    ssl: z.boolean().optional(),
  }),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  switch (request.method) {
    case 'POST': {
      const data = connectionSchema.parse(await request.json());
      
      // Get organization ID from the user's active organization
      // TODO: Implement organization selection
      const orgMember = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, user.id),
      });

      if (!orgMember) {
        throw json({ error: 'No organization found' }, { status: 404 });
      }

      // Create the connection
      const [connection] = await db.insert(databaseConnections)
        .values({
          name: data.name,
          type: data.type,
          organizationId: orgMember.organizationId,
          credentials: data.credentials,
        })
        .returning();

      // Test the connection
      try {
        const manager = ConnectionManager.getInstance();
        await manager.getConnection(connection.id);
      } catch (error) {
        // If connection fails, delete the record
        await db.delete(databaseConnections)
          .where(eq(databaseConnections.id, connection.id));
        
        throw json({ error: error.message }, { status: 400 });
      }

      return json(connection);
    }

    case 'PUT': {
      const { id } = z.object({ id: z.string() }).parse(await request.json());
      const data = connectionSchema.parse(await request.json());

      // Verify user has access to the connection
      const connection = await db.query.databaseConnections.findFirst({
        where: eq(databaseConnections.id, id),
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

      // Update the connection
      const [updated] = await db.update(databaseConnections)
        .set({
          name: data.name,
          credentials: data.credentials,
          updatedAt: new Date(),
        })
        .where(eq(databaseConnections.id, id))
        .returning();

      return json(updated);
    }

    case 'DELETE': {
      const { id } = z.object({ id: z.string() }).parse(await request.json());

      // Verify user has access to the connection
      const connection = await db.query.databaseConnections.findFirst({
        where: eq(databaseConnections.id, id),
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

      // Close the connection if it's active
      const manager = ConnectionManager.getInstance();
      await manager.closeConnection(id);

      // Delete the connection
      await db.delete(databaseConnections)
        .where(eq(databaseConnections.id, id));

      return json({ success: true });
    }

    default:
      throw json({ error: 'Method not allowed' }, { status: 405 });
  }
}
