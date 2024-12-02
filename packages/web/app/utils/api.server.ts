import type { TableDataResponse, TableSchema, QueryResult } from '../types';
import { pool } from './pool.server';
import { sanitizeTableName } from './sql-sanitizer.server';

export async function fetchSchema(): Promise<TableSchema[]> {
  console.log('Attempting to fetch schema...');
  const client = await pool.connect();
  try {
    console.log('Connected to database, executing query...');
    const result = await client.query<{
      table_name: string;
      connection_id: string;
      columns: Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }>;
      primary_key: string[] | null;
    }>(`
      SELECT 
        tables.table_name,
        connections.id as connection_id,
        json_agg(
          json_build_object(
            'column_name', columns.column_name,
            'data_type', columns.data_type,
            'is_nullable', columns.is_nullable,
            'column_default', columns.column_default
          )
        ) as columns,
        array_agg(DISTINCT CASE WHEN tc.constraint_type = 'PRIMARY KEY' 
          THEN columns.column_name 
          ELSE NULL 
        END) FILTER (WHERE tc.constraint_type = 'PRIMARY KEY') as primary_key
      FROM 
        information_schema.tables tables
      JOIN 
        information_schema.columns columns ON tables.table_name = columns.table_name
      LEFT JOIN 
        information_schema.table_constraints tc ON tables.table_name = tc.table_name
      LEFT JOIN 
        information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
          AND columns.column_name = kcu.column_name
      JOIN 
        connections ON connections.id = current_setting('app.current_connection_id')::uuid
      WHERE 
        tables.table_schema = 'public'
      GROUP BY 
        tables.table_name, connections.id;
    `);

    return result.rows.map(row => ({
      name: row.table_name,
      table_name: row.table_name,
      connectionId: row.connection_id,
      columns: row.columns.map(col => ({
        column_name: col.column_name,
        name: col.column_name,
        type: col.data_type,
        data_type: col.data_type,
        is_nullable: col.is_nullable,
        nullable: col.is_nullable === 'YES',
        column_default: col.column_default
      })),
      primary_key: row.primary_key?.filter(Boolean) || null,
      foreign_keys: [],
      rowCount: 0,
      sizeInBytes: 0
    }));
  } finally {
    client.release();
  }
}

export async function fetchTableData(
  tableName: string,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<TableDataResponse> {
  const sanitizedTableName = sanitizeTableName(tableName);
  const sanitizedSortBy = sortBy ? sanitizeTableName(sortBy) : null;
  
  const orderClause = sanitizedSortBy 
    ? `ORDER BY "${sanitizedSortBy}" ${sortOrder}`
    : '';

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM "${sanitizedTableName}" ${orderClause}`
    );
    
    return {
      data: result.rows,
      totalRows: result.rowCount || 0
    };
  } finally {
    client.release();
  }
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    return {
      rows: result.rows,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID
      }))
    };
  } finally {
    client.release();
  }
}
