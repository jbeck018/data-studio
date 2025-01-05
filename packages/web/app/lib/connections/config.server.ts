import { db } from "../db/db.server";
import { databaseConnections } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DatabaseConnection, ConnectionType, ConnectionConfig } from "../db/schema/types";

// Schema for validating inputs
const BaseConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"] as const),
  host: z.string().nullable(),
  port: z.string().nullable(),
  database: z.string().nullable(),
  username: z.string().nullable(),
  password: z.string().nullable(),
  ssl: z.boolean().nullable(),
  filepath: z.string().nullable(),
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

export const ConnectionSchema = z.discriminatedUnion("type", [
  StandardConnectionSchema,
  MongoDBConnectionSchema,
  RedisConnectionSchema,
  SQLiteConnectionSchema,
]);

export type ConnectionInput = {
  type: ConnectionType;
  name: string;
  host?: string | null;
  port?: string | null;
  database?: string | null;
  username?: string | null;
  password?: string | null;
  ssl?: boolean | null;
  filepath?: string | null;
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

export class ConnectionConfigManager {
  async createConnection(
    config: ConnectionConfig
  ): Promise<DatabaseConnection> {
    const [connection] = await db
      .insert(databaseConnections)
      .values({
        type: config.type,
        name: config.name,
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: config.password,
        ssl: config.ssl,
        filepath: config.filepath,
        organizationId: config.organizationId,
      })
      .returning();

    return connection;
  }

  async updateConnection(
    id: string,
    updates: Partial<ConnectionConfig>
  ): Promise<DatabaseConnection> {
    const [connection] = await db
      .update(databaseConnections)
      .set(updates)
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
      .delete(databaseConnections)
      .where(eq(databaseConnections.id, id));
  }

  async validateConnectionConfig(config: ConnectionConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      switch (config.type) {
        case "POSTGRES":
        case "MYSQL":
        case "MSSQL":
        case "ORACLE":
          if (!config.host) return { valid: false, error: "Host is required" };
          if (!config.port) return { valid: false, error: "Port is required" };
          if (!config.username) return { valid: false, error: "Username is required" };
          if (!config.password) return { valid: false, error: "Password is required" };
          if (!config.database) return { valid: false, error: "Database is required" };
          break;
        case "SQLITE":
          if (!config.filepath) return { valid: false, error: "File path is required" };
          break;
        case "MONGODB":
        case "REDIS":
          if (!config.host) return { valid: false, error: "Host is required" };
          if (!config.port) return { valid: false, error: "Port is required" };
          if (!config.username) return { valid: false, error: "Username is required" };
          if (!config.password) return { valid: false, error: "Password is required" };
          break;
      }

      if (config.port) {
        const port = Number.parseInt(config.port, 10);
        if (Number.isNaN(port) || port <= 0 || port > 65535) {
          return { valid: false, error: "Invalid port number" };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Invalid connection configuration" };
    }
  }
}

export async function createConnection(
  organizationId: string,
  input: ConnectionInput
): Promise<DatabaseConnection> {
  const config: ConnectionConfig = {
    ...input,
    organizationId,
    host: input.host ?? null,
    port: input.port ?? null,
    database: input.database ?? null,
    username: input.username ?? null,
    password: input.password ?? null,
    ssl: input.ssl ?? null,
    filepath: input.filepath ?? null,
  };

  const manager = new ConnectionConfigManager();
  const validation = await manager.validateConnectionConfig(config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return manager.createConnection(config);
}

export async function updateConnection(
  id: string,
  organizationId: string,
  input: Partial<ConnectionInput>
): Promise<DatabaseConnection> {
  const manager = new ConnectionConfigManager();
  const existingConnection = await manager.getConnection(id);
  
  if (!existingConnection || existingConnection.organizationId !== organizationId) {
    throw new Error('Connection not found');
  }

  const updates: Partial<ConnectionConfig> = {
    ...input,
    host: input.host ?? existingConnection.host,
    port: input.port ?? existingConnection.port,
    database: input.database ?? existingConnection.database,
    username: input.username ?? existingConnection.username,
    password: input.password ?? existingConnection.password,
    ssl: input.ssl ?? existingConnection.ssl,
    filepath: input.filepath ?? existingConnection.filepath,
  };

  const validation = await manager.validateConnectionConfig({
    ...existingConnection,
    ...updates,
  } as ConnectionConfig);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return manager.updateConnection(id, updates);
}

export async function getConnection(id: string, organizationId: string): Promise<DatabaseConnection | null> {
  const manager = new ConnectionConfigManager();
  const connection = await manager.getConnection(id);
  
  if (!connection || connection.organizationId !== organizationId) {
    return null;
  }

  return connection;
}

export async function listConnections(organizationId: string): Promise<DatabaseConnection[]> {
  const manager = new ConnectionConfigManager();
  return manager.getConnectionsByOrganization(organizationId);
}

export async function testConnection(input: ConnectionInput): Promise<boolean> {
  const config: ConnectionConfig = {
    ...input,
    organizationId: '', // This will be set by the calling function
    host: input.host ?? null,
    port: input.port ?? null,
    database: input.database ?? null,
    username: input.username ?? null,
    password: input.password ?? null,
    ssl: input.ssl ?? null,
    filepath: input.filepath ?? null,
  };

  const manager = new ConnectionConfigManager();
  const validation = await manager.validateConnectionConfig(config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return true; // TODO: Implement actual connection testing
}
