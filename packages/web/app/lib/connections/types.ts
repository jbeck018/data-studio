import { z } from "zod";
import type { ConnectionType } from "../db/schema";

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