import type { TableDataResponse, TableSchema, QueryResult } from '~/types';
import { pool } from './pool.server';
import { sanitizeTableName } from './sql-sanitizer.server';

export async function fetchSchema(): Promise<TableSchema[]> {
  console.log('Attempting to fetch schema...');
  const client = await pool.connect();
  try {
    console.log('Connected to database, executing query...');
    const result = await client.query<{
      table_name: string;
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
        json_agg(
          json_build_object(
            'column_name', columns.column_name,
            'data_type', columns.data_type,
            'is_nullable', columns.is_nullable,
            'column_default', columns.column_default
          )
        ) as columns,
        json_agg(
          CASE WHEN pk.column_name IS NOT NULL 
          THEN columns.column_name 
          END
        ) FILTER (WHERE pk.column_name IS NOT NULL) as primary_key
      FROM 
        information_schema.tables
        JOIN information_schema.columns ON tables.table_name = columns.table_name
        LEFT JOIN (
          SELECT 
            tc.table_name, kcu.column_name
          FROM 
            information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON tables.table_name = pk.table_name 
          AND columns.column_name = pk.column_name
      WHERE 
        tables.table_schema = 'public'
      GROUP BY 
        tables.table_name;
    `);

    return result.rows.map(row => ({
      name: row.table_name,
      columns: row.columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default || undefined
      })),
      primaryKey: row.primary_key || undefined,
      rowCount: 0, // This would need a separate query to get accurate count
      sizeInBytes: 0 // This would need a separate query to get accurate size
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
