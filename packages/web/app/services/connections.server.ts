import { db } from "../lib/db/db.server";
import { databaseConnections, type ConnectionConfig } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';
import { z } from "zod";

// Base type from database schema
export type DatabaseConnection = InferSelectModel<typeof databaseConnections>;

// Schema for validating inputs
const BaseConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["POSTGRES", "MYSQL", "SQLITE", "MSSQL", "ORACLE", "MONGODB", "REDIS"] as const),
});

const StandardConnectionSchema = BaseConnectionSchema.extend({
  type: z.enum(["POSTGRES", "MYSQL", "MSSQL", "ORACLE"] as const),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required").regex(/^\d+$/, "Port must be a number"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().default(false),
});

const MongoDBConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("MONGODB"),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required").regex(/^\d+$/, "Port must be a number"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().default(false),
  authSource: z.string().optional(),
  replicaSet: z.string().optional(),
});

const RedisConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("REDIS"),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required").regex(/^\d+$/, "Port must be a number"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().regex(/^\d+$/, "Database must be a number").optional(),
  ssl: z.boolean().default(false),
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

export type ConnectionInput = z.infer<typeof ConnectionSchema>;

function createConnectionConfig(input: ConnectionInput): ConnectionConfig {
  switch (input.type) {
    case "SQLITE":
      return {
        type: input.type,
        filepath: input.filepath,
      };
    case "MONGODB":
      return {
        type: input.type,
        host: input.host,
        port: parseInt(input.port),
        database: input.database,
        username: input.username,
        password: input.password,
        ssl: input.ssl,
        authSource: input.authSource,
        replicaSet: input.replicaSet,
      };
    case "REDIS":
      return {
        type: input.type,
        host: input.host,
        port: parseInt(input.port),
        username: input.username,
        password: input.password,
        database: input.database ? input.database : undefined,
        ssl: input.ssl,
      };
    default:
      return {
        type: input.type,
        host: input.host,
        port: parseInt(input.port),
        database: input.database,
        username: input.username,
        password: input.password,
        ssl: input.ssl,
      };
  }
}

export async function createConnection(
  organizationId: string,
  createdById: string,
  input: ConnectionInput
): Promise<DatabaseConnection> {
  const config = createConnectionConfig(input);
  
  return await db.insert(databaseConnections)
    .values({
      name: input.name,
      type: input.type,
      organizationId,
      createdById,
      config,
      archived: false,
    })
    .returning()
    .then(rows => rows[0]);
}

export async function updateConnection(
  id: string, 
  organizationId: string, 
  input: Partial<ConnectionInput>
): Promise<DatabaseConnection> {
  // Get existing connection
  const existing = await getConnection(id, organizationId);
  if (!existing) {
    throw new Error("Connection not found");
  }

  // Merge input with existing config
  const merged = {
    ...existing.config,
    ...input,
    name: input.name ?? existing.name,
    type: input.type ?? existing.config.type,
  } as ConnectionInput;

  // Validate merged input
  const parsed = ConnectionSchema.parse(merged);
  const config = createConnectionConfig(parsed);

  return await db.update(databaseConnections)
    .set({
      name: parsed.name,
      type: parsed.type,
      config,
      updatedAt: new Date(),
    })
    .where(and(
      eq(databaseConnections.id, id),
      eq(databaseConnections.organizationId, organizationId)
    ))
    .returning()
    .then(rows => rows[0]);
}

export async function deleteConnection(id: string, organizationId: string): Promise<void> {
  await db.delete(databaseConnections)
    .where(and(
      eq(databaseConnections.id, id),
      eq(databaseConnections.organizationId, organizationId)
    ));
}

export async function getConnection(id: string, organizationId: string): Promise<DatabaseConnection | null> {
  const connection = await db.select()
    .from(databaseConnections)
    .where(and(
      eq(databaseConnections.id, id),
      eq(databaseConnections.organizationId, organizationId)
    ))
    .then(rows => rows[0] ?? null);

  return connection;
}

export async function listConnections(organizationId: string): Promise<DatabaseConnection[]> {
  return await db.select()
    .from(databaseConnections)
    .where(eq(databaseConnections.organizationId, organizationId));
}

export async function testConnection(input: ConnectionInput): Promise<boolean> {
  // TODO: Implement actual connection testing logic
  return true;
}
