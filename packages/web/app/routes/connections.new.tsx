import { ActionFunctionArgs, json } from "@remix-run/node";
import { db } from "../lib/db/db.server";
import { databaseConnections } from "../lib/db/schema/connections";
import { z } from "zod";
import { requireUser } from "../lib/auth/session.server";
import { DATABASE_TYPES } from "../lib/db/schema";
import type { DatabaseType } from "../lib/db/schema";
import type { StandardConnectionConfig, SQLiteConnectionConfig, MongoDBConnectionConfig, RedisConnectionConfig } from "../lib/db/schema/connections";

// Use the same schema from the client side for validation
const ConnectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(DATABASE_TYPES),
  host: z.string().optional(),
  port: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  ssl: z.string().transform(val => val === 'true').optional(),
  filepath: z.string().optional(),
  authSource: z.string().optional(),
  replicaSet: z.string().optional(),
});

type ConnectionFormData = z.infer<typeof ConnectionSchema>;

function createConnectionConfig(data: ConnectionFormData) {
  const baseConfig = {
    type: data.type,
    host: data.host,
    port: data.port,
    username: data.username,
    password: data.password,
    database: data.database,
    ssl: data.ssl,
  };

  switch (data.type) {
    case 'SQLITE':
      return {
        type: data.type,
        filepath: data.filepath,
      } as SQLiteConnectionConfig;
    case 'MONGODB':
      return {
        ...baseConfig,
        type: data.type,
        authSource: data.authSource,
        replicaSet: data.replicaSet,
      } as MongoDBConnectionConfig;
    case 'REDIS':
      return {
        type: data.type,
        host: data.host,
        port: data.port,
        username: data.username,
        password: data.password,
      } as RedisConnectionConfig;
    default:
      return baseConfig as StandardConnectionConfig & { type: Exclude<DatabaseType, 'MONGODB' | 'REDIS' | 'SQLITE'> };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData.entries());

  // Validate the form data
  const validationResult = ConnectionSchema.safeParse(formObject);

  if (!validationResult.success) {
    return json({ errors: validationResult.error.flatten() }, { status: 400 });
  }

  const data = validationResult.data;
  const config = createConnectionConfig(data);

  try {
    // Insert the connection into the database
    const [newConnection] = await db.insert(databaseConnections)
      .values({
        name: data.name,
        type: data.type,
        organizationId: user.currentOrganization!.id,
        createdById: user.id,
        config,
      })
      .returning();

    return json({ connection: newConnection });
  } catch (error) {
    console.error('Failed to create connection:', error);
    return json({ errors: { _errors: ['Failed to create connection'] } }, { status: 500 });
  }
}
