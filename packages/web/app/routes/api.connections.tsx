import { type ActionFunctionArgs } from 'react-router';
import { z } from 'zod';
import { db } from '../lib/db/db.server';
import { ConnectionConfig, databaseConnections, NewDatabaseConnection, organizationMemberships } from '../lib/db/schema';
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
          await manager.createConnection('temp-test', {
            ...connectionConfig.config,
            name: data.name,
            type: data.type,
          } as unknown as ConnectionConfig);
  
          // Close the temporary test connection
          await manager.closeConnection('temp-test');
  
          return { success: true, message: "Connection successful" };
        } catch (error) {
          console.error("Connection test error:", error);
          return { 
            error: error instanceof Error ? error.message : "Failed to test connection",
            status: 400
          };
        }
      }

      const data = connectionSchema.parse(await request.json());
      
      // Get organization ID from the user's active organization
      const orgMember = await db.query.organizationMemberships.findFirst({
        where: eq(organizationMemberships.userId, user.id),
      });

      if (!orgMember) {
        return { error: 'No organization found', status: 404 };
      }

      const newConnection: NewDatabaseConnection = {
        ...data.credentials,
        name: data.name,
        type: data.type,
        organizationId: orgMember.organizationId,
        port: data.credentials.port ? data.credentials.port.toString() : undefined,
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
        
        return { 
          error: error instanceof Error ? error.message : "Connection test failed",
          status: 400
        };
      }

      return connection;
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
                where: eq(organizationMemberships.userId, user.id),
              },
            },
          },
        },
      });

      if (!connection) {
        return { error: 'Connection not found', status: 404 };
      }

      // Update the connection
      const [updated] = await db.update(databaseConnections)
        .set({
          ...connection, 
          ...updateData.credentials,
          name: updateData.name,
          port: updateData.credentials.port ? updateData.credentials.port.toString() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(databaseConnections.id, id))
        .returning();

      return updated;
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
                where: eq(organizationMemberships.userId, user.id),
              },
            },
          },
        },
      });

      if (!connection) {
        return { error: 'Connection not found', status: 404 };
      }

      // Close the connection if it's active
      const manager = ConnectionManager.getInstance();
      await manager.closeConnection(id);

      // Delete the connection
      await db.delete(databaseConnections)
        .where(eq(databaseConnections.id, id));

      return { success: true };
    }

    default:
      return { error: 'Method not allowed', status: 405 };
  }
}
