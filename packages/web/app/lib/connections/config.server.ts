import { db } from "../db/db.server";
import { databaseConnections } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import type { DatabaseConnection, ConnectionType } from "../db/schema/connections";

// Schema for validating inputs
const BaseConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"] as const),
  host: z.string().optional(),
  port: z.string().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
  filepath: z.string().optional(),
  authSource: z.string().optional(),
  replicaSet: z.string().optional(),
});

const StandardConnectionSchema = BaseConnectionSchema.extend({
  type: z.enum(["POSTGRES", "MYSQL", "MSSQL", "ORACLE"] as const),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const MongoDBConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("MONGODB"),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const RedisConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("REDIS"),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().default("0"),
});

const SQLiteConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("SQLITE"),
  filepath: z.string().min(1, "File path is required"),
});

// Updated ConnectionConfig type
export type ConnectionConfig = Omit<DatabaseConnection, 'id'> & {
  organizationId: string;
  createdById: string;
  filepath?: string;
  authSource?: string;
  replicaSet?: string;
};

export type ConnectionInput = z.infer<typeof BaseConnectionSchema> & {
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  filepath?: string;
  authSource?: string;
  replicaSet?: string;
};

export function getDefaultPort(type: ConnectionType): number {
  switch (type) {
    case "POSTGRES":
      return 5432;
    case "MYSQL":
      return 3306;
    case "MONGODB":
      return 27017;
    case "REDIS":
      return 6379;
    case "MSSQL":
      return 1433;
    case "ORACLE":
      return 1521;
    default:
      return 0;
  }
}

export { type DatabaseConnection };

export class ConnectionConfigManager {
  async createConnection(
    config: z.infer<typeof StandardConnectionSchema> | z.infer<typeof MongoDBConnectionSchema> | z.infer<typeof RedisConnectionSchema> | z.infer<typeof SQLiteConnectionSchema>
  ): Promise<DatabaseConnection> {
    const connectionData: ConnectionConfig = {
      name: config.name,
      type: config.type,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      ssl: config.ssl,
      filepath: config.filepath,
      authSource: config.authSource,
      replicaSet: config.replicaSet,
      organizationId: config.organizationId,
      createdById: config.createdById,
    };

    const [connection] = await db
      .insert(databaseConnections)
      .values(connectionData)
      .returning();

    return connection;
  }

  async updateConnection(
    id: string,
    config: Partial<ConnectionConfig> & {
      name?: string;
      type?: ConnectionType;
    }
  ): Promise<DatabaseConnection> {
    const [connection] = await db
      .update(databaseConnections)
      .set({
        ...(config.name && { name: config.name }),
        ...(config.type && { type: config.type }),
        ...(config.host && { host: config.host }),
        ...(config.port && { port: config.port }),
        ...(config.username && { username: config.username }),
        ...(config.password && { password: config.password }),
        ...(config.database && { database: config.database }),
        ...(config.ssl && { ssl: config.ssl }),
      })
      .where(eq(databaseConnections.id, id))
      .returning();

    return connection;
  }

  async getConnection(id: string): Promise<DatabaseConnection | null> {
    const connection = await db.query.databaseConnections.findFirst({
      where: eq(databaseConnections.id, id),
    });
    return connection;
  }

  async getConnectionsByOrganization(organizationId: string): Promise<DatabaseConnection[]> {
    const connections = await db.query.databaseConnections.findMany({
      where: eq(databaseConnections.organizationId, organizationId),
    });
    return connections;
  }

  async deleteConnection(id: string): Promise<void> {
    await db
      .update(databaseConnections)
      .set({ archived: true })
      .where(eq(databaseConnections.id, id));
  }

  async validateConnectionConfig(config: ConnectionConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic validation
      if (!config.host) return { valid: false, error: "Host is required" };
      if (!config.port) return { valid: false, error: "Port is required" };
      if (!config.username) return { valid: false, error: "Username is required" };
      if (!config.password) return { valid: false, error: "Password is required" };
      if (!config.database) return { valid: false, error: "Database is required" };

      // Port number validation
      const port = parseInt(config.port);
      if (isNaN(port) || port <= 0 || port > 65535) {
        return { valid: false, error: "Invalid port number" };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Invalid connection configuration" };
    }
  }
}

export async function createConnection(
  config: z.infer<typeof StandardConnectionSchema> | z.infer<typeof MongoDBConnectionSchema> | z.infer<typeof RedisConnectionSchema> | z.infer<typeof SQLiteConnectionSchema>
): Promise<DatabaseConnection> {
  const connectionData: ConnectionConfig = {
    name: config.name,
    type: config.type,
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    ssl: config.ssl,
    filepath: config.filepath,
    authSource: config.authSource,
    replicaSet: config.replicaSet,
    organizationId: config.organizationId,
    createdById: config.createdById,
  };

  const [connection] = await db
    .insert(databaseConnections)
    .values(connectionData)
    .returning();

  return connection;
}

export async function updateConnection(
  id: string,
  organizationId: string,
  input: Partial<ConnectionInput>
): Promise<DatabaseConnection> {
  const existingConnection = await getConnection(id, organizationId);
  if (!existingConnection) {
    throw new Error('Connection not found');
  }

  const updatedConfig = {
    ...existingConnection.config,
    ...input,
  } as ConnectionConfig;

  const connectionConfigManager = new ConnectionConfigManager();
  const result = await connectionConfigManager.validateConnectionConfig(updatedConfig);
  if (!result.valid) {
    throw new Error(result.error);
  }

  const connection = await connectionConfigManager.updateConnection(id, updatedConfig);
  return connection;
}

export async function deleteConnection(id: string, organizationId: string): Promise<void> {
  const connectionConfigManager = new ConnectionConfigManager();
  await connectionConfigManager.deleteConnection(id);
}

export async function getConnection(id: string, organizationId: string): Promise<DatabaseConnection | null> {
  const connectionConfigManager = new ConnectionConfigManager();
  const connection = await connectionConfigManager.getConnection(id);
  if (!connection) {
    return null;
  }

  if (connection.organizationId !== organizationId) {
    return null;
  }

  return connection;
}

export async function listConnections(organizationId: string): Promise<DatabaseConnection[]> {
  const connectionConfigManager = new ConnectionConfigManager();
  const connections = await connectionConfigManager.getConnectionsByOrganization(organizationId);
  return connections;
}

export async function testConnection(input: ConnectionInput): Promise<boolean> {
  const config = createConnectionConfig(input);
  const connectionConfigManager = new ConnectionConfigManager();
  const result = await connectionConfigManager.validateConnectionConfig(config);
  if (!result.valid) {
    throw new Error(result.error);
  }

  return true; // TODO: Implement actual connection testing
}

function createConnectionConfig(input: ConnectionInput): ConnectionConfig {
  const { type, name, ...rest } = input;
  const baseConfig = {
    type,
    name,
    ...rest,
  };

  switch (type) {
    case 'POSTGRES':
    case 'MYSQL':
    case 'MSSQL':
    case 'ORACLE':
      return {
        ...baseConfig,
        type,
        host: input.host || 'localhost',
        port: input.port || getDefaultPort(type).toString(),
        database: input.database || '',
        username: input.username || '',
        password: input.password || '',
        ssl: input.ssl || false,
      };

    case 'SQLITE':
      return {
        ...baseConfig,
        type,
        filepath: input.filepath || ':memory:',
      };

    case 'MONGODB':
      return {
        ...baseConfig,
        type,
        host: input.host || 'localhost',
        port: input.port || getDefaultPort(type).toString(),
        database: input.database || '',
        username: input.username || '',
        password: input.password || '',
        ssl: input.ssl || false,
        authSource: input.authSource || 'admin',
        replicaSet: input.replicaSet,
      };

    case 'REDIS':
      return {
        ...baseConfig,
        type,
        host: input.host || 'localhost',
        port: input.port || getDefaultPort(type).toString(),
        username: input.username || '',
        password: input.password || '',
        database: (input.database || '0').toString(),
        ssl: input.ssl || false,
      };

    default:
      throw new Error(`Unsupported connection type: ${type}`);
  }
}
