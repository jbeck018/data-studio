import { json, type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { db } from '../lib/db/db.server';
import { ConnectionConfig, databaseConnections, NewDatabaseConnection, organizationMembers } from '../lib/db/schema';
import { requireUser } from '../lib/auth/session.server';
import { eq } from 'drizzle-orm';
import { ConnectionManager } from '../lib/db/connection-manager.server';

const connectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"]),
  credentials: z.object({
    host: z.string().optional(),
    port: z.union([z.string(), z.number()]).optional(),
    database: z.string().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional(),
    filepath: z.string().optional(),
  }),
});

const connectionTestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"]),
  host: z.string().optional(),
  port: z.union([z.string(), z.number()]).optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
  filepath: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  switch (request.method) {
    case 'POST': {
      if (request.headers.get('is-test') === 'true') {
        try {
          // Parse the connection data
          const res = await request.json();
          const data = connectionTestSchema.parse(res);
  
          // Normalize port to number if it's a string
          const port = typeof data.port === 'string' ? parseInt(data.port, 10) : data.port;
  
          // Prepare connection configuration based on type
          const connectionConfig = {
            type: data.type.toLowerCase(),
            config: {
              type: data.type.toLowerCase(),
              host: data.host,
              port: port,
              database: data.database,
              username: data.username,
              password: data.password,
              ssl: data.ssl,
              filepath: data.filepath,
            },
          };
  
          // Test the connection using ConnectionManager
          const manager = ConnectionManager.getInstance();
          await manager.testConnection({
            type: connectionConfig.type,
            config: connectionConfig.config as ConnectionConfig,
          });
  
          return json({ success: true, message: "Connection successful" });
        } catch (error) {
          console.error("Connection test error:", error);
          return json({ 
            error: error instanceof Error ? error.message : "Failed to test connection" 
          }, { status: 400 });
        }
      }

      const data = connectionSchema.parse(await request.json());
      
      // Get organization ID from the user's active organization
      const orgMember = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, user.id),
      });

      if (!orgMember) {
        return json({ error: 'No organization found' }, { status: 404 });
      }

      const newConnection: NewDatabaseConnection = {
        name: data.name,
        type: data.type,
        organizationId: orgMember.organizationId,
        config: { type: data.type, ...data.credentials } as ConnectionConfig,
        createdById: user.id,
      };
      // Create the connection
      const [connection] = await db.insert(databaseConnections)
        .values(newConnection)
        .returning();

      // Test the connection
      try {
        const manager = ConnectionManager.getInstance();
        await manager.getConnection(connection.id);
      } catch (error) {
        // If connection fails, delete the record
        await db.delete(databaseConnections)
          .where(eq(databaseConnections.id, connection.id));
        
        return json({ 
          error: error instanceof Error ? error.message : "Connection test failed" 
        }, { status: 400 });
      }

      return json(connection);
    }

    case 'PUT': {
      const updateSchema = z.object({ 
        id: z.string(),
        name: z.string().min(1),
        credentials: z.object({
          host: z.string().optional(),
          port: z.union([z.string(), z.number()]).optional(),
          database: z.string().optional(),
          user: z.string().optional(),
          password: z.string().optional(),
          ssl: z.boolean().optional(),
          filepath: z.string().optional(),
        }),
      });
      
      const { id, ...updateData } = updateSchema.parse(await request.json());

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
        return json({ error: 'Connection not found' }, { status: 404 });
      }

      // Update the connection
      const [updated] = await db.update(databaseConnections)
        .set({
          name: updateData.name,
          config: { ...connection.config, ...updateData.credentials } as ConnectionConfig,
          updatedAt: new Date(),
        })
        .where(eq(databaseConnections.id, id))
        .returning();

      return json(updated);
    }

    case 'DELETE': {
      const deleteSchema = z.object({ id: z.string() });
      const { id } = deleteSchema.parse(await request.json());

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
        return json({ error: 'Connection not found' }, { status: 404 });
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
      return json({ error: 'Method not allowed' }, { status: 405 });
  }
}
