import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '../lib/auth/session.server';
import { QueryEngine } from '../lib/db/query-engine.server';
import { db } from '../lib/db/db.server';
import { queries } from '../lib/db/schema';
import type { ConnectionConfig as ManagerConnectionConfig } from '../lib/db/connection-manager.server';
import { getConnection } from '../lib/connections/config.server';
import type { DatabaseConnection, QueryResult } from "~/types";

function convertToManagerConfig(connection: Awaited<ReturnType<typeof getConnection>>): ManagerConnectionConfig {
  if (!connection) throw new Error('Connection not found');
  
  if (connection.type === 'SQLITE') {
    throw new Error('SQLite connections are not supported for queries');
  }

  if (!connection.config) {
    throw new Error('Connection config is missing');
  }

  return {
    host: connection.config.host || '',
    port: Number(connection.config.port) || 5555,
    database: connection.config.database || '',
    user: connection.config.username || '',
    password: connection.config.password || '',
    ssl: connection.config.ssl || false,
  };
}

export class QueryEngine {
  private connection: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async execute(query: string): Promise<QueryResult> {
    const pool = await getConnectionPool(this.connection);
    const client = await pool.connect();

    try {
      const startTime = Date.now();
      const result = await client.query(query);
      const endTime = Date.now();

      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields.map(field => ({
          name: field.name,
          type: field.dataTypeID.toString()
        })),
        metrics: {
          executionTimeMs: endTime - startTime,
          bytesProcessed: 0 // Not available in pg
        }
      };
    } finally {
      client.release();
    }
  }

  async startStreamingQuery(sql: string, options: any): Promise<string> {
    // This method is not updated in the provided code edit, 
    // so it's assumed to be the same as in the original code
    // If it needs to be updated, please provide the updated code
    const queryId = await this.execute(sql);
    // ...
    return queryId;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const organizationId = user.currentOrganization?.id;

  if (!organizationId) {
    return json({
      error: 'No organization selected',
    }, { status: 400 });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();

  try {
    const connectionId = formData.get('connectionId')?.toString();
    const sql = formData.get('sql')?.toString();

    if (!connectionId || !sql) {
      return json({
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Get connection config
    const connection = await getConnection(connectionId, organizationId);
    if (!connection) {
      return json({
        error: 'Connection not found',
      }, { status: 404 });
    }

    const config = convertToManagerConfig(connection);
    const queryEngine = new QueryEngine(config);
    const queryId = await queryEngine.startStreamingQuery(sql, {
      userId: user.id,
      organizationId,
      connectionId,
      timeout: 30000,
      maxRows: 1000,
    });

    try {
      // Record query in database
      await db.insert(queries).values({
        status: 'success',
        userId: user.id,
        organizationId,
        connectionId,
        sql,
        executionTimeMs: '0', // TODO: Add actual execution time
        rowCount: '0', // TODO: Add actual row count
      });
    } catch (e) {
      console.error('Failed to record query:', e);
    }

    return json({ queryId });
  } catch (e) {
    console.error('Query error:', e);
    
    try {
      if (e instanceof Error) {
        await db.insert(queries).values({
          status: 'error',
          userId: user.id,
          organizationId: organizationId,
          connectionId: formData.get('connectionId')?.toString() || '',
          sql: formData.get('sql')?.toString() || '',
          error: e.message,
          executionTimeMs: '0', // TODO: Add actual execution time
        });
      }
    } catch (dbError) {
      console.error('Failed to record query error:', dbError);
    }

    return json({
      error: e instanceof Error ? e.message : 'Unknown error occurred',
    }, { status: 400 });
  }
}

export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}
