import { db } from "../../lib/db/db.server";
import { databaseConnections } from "../db/schema/connections";
import type { StandardConnectionConfig } from "../db/schema/connections";

export type DatabaseConnectionType = "POSTGRES" | "MYSQL";

export interface DatabaseConnectionData {
  name: string;
  type: DatabaseConnectionType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  organizationId: string;
  createdById: string;
}

export async function createDatabaseConnection(data: DatabaseConnectionData) {
  // TODO: Add validation to check if connection works before saving
  const [connection] = await db.insert(databaseConnections)
    .values({
      name: data.name,
      type: data.type,
      config: {
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        ssl: data.ssl
      } satisfies StandardConnectionConfig,
      organizationId: data.organizationId,
      createdById: data.createdById,
    })
    .returning();

  return connection;
}
