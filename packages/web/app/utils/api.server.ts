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
      tableName: row.table_name,
      name: row.table_name,
      connectionId: row.connection_id,
      columns: row.columns.map(col => ({
        columnName: col.column_name,
        name: col.column_name,
        type: col.data_type,
        dataType: col.data_type,
        isNullable: col.is_nullable === 'YES',
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default,
      })),
      primaryKeys: row.primary_key?.filter(Boolean) || null,
      foreignKeys: [],
      rowCount: 0,
      sizeInBytes: 0
    }));
  } finally {
    client.release();
  }
}

export async function getTableSchema(tableName: string): Promise<TableSchema[]> {
  const sanitizedTableName = sanitizeTableName(tableName);
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type,
        kcu.referenced_table_name,
        kcu.referenced_column_name
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_name = kcu.table_name
        AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE c.table_name = $1
      ORDER BY c.ordinal_position`,
      [sanitizedTableName]
    );

    const columns = result.rows.map((row) => ({
      columnName: row.column_name,
      name: row.column_name,
      type: row.data_type,
      dataType: row.data_type,
      isNullable: row.is_nullable === 'YES',
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
    }));

    const primaryKeys = result.rows
      .filter((row) => row.constraint_type === 'PRIMARY KEY')
      .map((row) => row.column_name);

    const foreignKeys = result.rows
      .filter((row) => row.constraint_type === 'FOREIGN KEY')
      .map((row) => ({
        columnName: row.column_name,
        referencedTable: row.referenced_table_name,
        referencedColumn: row.referenced_column_name,
      }));

    const stats = await client.query(
      `SELECT 
        pg_total_relation_size($1) as total_bytes,
        (SELECT reltuples::bigint FROM pg_class WHERE relname = $1) as row_count
      `,
      [sanitizedTableName]
    );

    return [{
      tableName: sanitizedTableName,
      name: sanitizedTableName,
      connectionId: client.id,
      columns,
      primaryKeys,
      foreignKeys,
      rowCount: parseInt(stats.rows[0].row_count || '0'),
      sizeInBytes: parseInt(stats.rows[0].total_bytes || '0'),
    }];
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
  const startTime = Date.now();
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    const endTime = Date.now();

    return {
      columns: result.fields.map((field) => ({
        name: field.name,
        dataTypeId: field.dataTypeID,
      })),
      rows: result.rows,
      rowCount: result.rowCount || 0,
      executionTime: endTime - startTime,
    };
  } finally {
    client.release();
  }
}
