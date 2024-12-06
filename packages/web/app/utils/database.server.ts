import { connectionManager } from '../lib/db/connection-manager.server';
import type { BaseConnection } from '../lib/db/connection-handlers.server';
import type { TableSchema } from '../types/schema';
import type { QueryResult } from '../types';

export async function withConnection<T>(
  connectionId: string,
  organizationId: string,
  callback: (connection: BaseConnection) => Promise<T>
): Promise<T> {
  const connection = await connectionManager.getConnection(connectionId, organizationId);
  try {
    return await callback(connection);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}

export async function fetchDatabaseSchema(connectionId: string, organizationId: string): Promise<TableSchema[]> {
  return withConnection(connectionId, organizationId, async (connection) => {
    // Query to get table information
    const schemaQuery = `
      SELECT 
        tables.table_name,
        json_agg(
          json_build_object(
            'column_name', columns.column_name,
            'data_type', columns.data_type,
            'is_nullable', columns.is_nullable,
            'column_default', columns.column_default
          )
        ) as columns,
        array_agg(DISTINCT CASE 
          WHEN tc.constraint_type = 'PRIMARY KEY' THEN columns.column_name 
          ELSE NULL 
        END) FILTER (WHERE tc.constraint_type = 'PRIMARY KEY') as primary_key,
        json_agg(DISTINCT CASE 
          WHEN tc.constraint_type = 'FOREIGN KEY' THEN json_build_object(
            'column_name', kcu.column_name,
            'foreign_table_name', ccu.table_name,
            'foreign_column_name', ccu.column_name
          )
          ELSE NULL
        END) FILTER (WHERE tc.constraint_type = 'FOREIGN KEY') as foreign_keys
      FROM information_schema.tables tables
      JOIN information_schema.columns columns ON tables.table_name = columns.table_name
      LEFT JOIN information_schema.table_constraints tc 
        ON tables.table_name = tc.table_name AND tables.table_schema = tc.table_schema
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tables.table_schema = 'public'
      GROUP BY tables.table_name;
    `;

    try {
      const result = await connection.query(schemaQuery);
      return result.rows.map((table: any) => ({
        table_name: table.table_name,
        connectionId,
        columns: table.columns || [],
        primary_key: table.primary_key?.filter(Boolean) || null,
        foreign_keys: table.foreign_keys?.filter(Boolean) || null,
      }));
    } catch (error) {
      console.error('Failed to fetch schema:', error);
      return [];
    }
  });
}

export async function executeQuery(sql: string, connection: BaseConnection): Promise<QueryResult> {
  try {
    const startTime = Date.now();
    const result = await connection.query(sql);
    const endTime = Date.now();

    const rows = Array.isArray(result) ? result : result.rows || [];
    const columns = rows.length > 0 
      ? Object.keys(rows[0]).map(name => ({ name, type: typeof rows[0][name] }))
      : [];

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTime: endTime - startTime,
    };
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}
