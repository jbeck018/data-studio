import { ConnectionManager } from '../lib/db/connection-manager.server';
import type { QueryField, QueryResult, TableSchema, ForeignKeySchema } from '../types/query';

export interface DatabaseTableSchema extends TableSchema {
  tableName: string;
  connectionId: string;
  comment?: string;
}

export interface DatabaseColumn {
  columnName: string;
  name: string;
  type: string;
  dataType: string;
  isNullable: boolean;
  nullable: boolean;
  defaultValue: string | null;
  comment?: string;
}

export interface ForeignKeyConstraint extends ForeignKeySchema {
  referencedTable: string;
  referencedColumn: string;
}

export interface DatabaseQueryField extends QueryField {
  name: string;
  dataType: string;
  tableId?: string;
  nullable?: boolean;
  columnId?: string;
  dataTypeSize?: number;
  dataTypeModifier?: number;
  format?: string;
}

export interface DatabaseQueryResult extends QueryResult {
  fields: DatabaseQueryField[];
  rows: any[];
  rowCount: number;
  metrics: {
    executionTime: number;
    rowCount: number;
    error?: string;
    warning?: string;
    notice?: string;
  };
}

const connectionManager = ConnectionManager.getInstance();

export async function withConnection<T>(
  connectionId: string,
  organizationId: string,
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await connectionManager.getConnection(connectionId);
  try {
    return await callback(connection);
  } finally {
    await connectionManager.resetConnection(connectionId);
  }
}

export async function fetchDatabaseSchema(
  connectionId: string,
  organizationId: string
): Promise<DatabaseTableSchema[]> {
  return withConnection(connectionId, organizationId, async (connection) => {
    const query = `
      SELECT 
        t.table_name,
        t.table_schema,
        obj_description((quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass) as table_comment,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        col_description((quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass, c.ordinal_position) as column_comment
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON 
        t.table_schema = c.table_schema AND 
        t.table_name = c.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position
    `;

    const result = await connection.query(query);
    const tables: Map<string, DatabaseTableSchema> = new Map();

    result.rows.forEach((row: any) => {
      const tableName = row.table_name;
      if (!tables.has(tableName)) {
        tables.set(tableName, {
          name: tableName,
          tableName,
          connectionId,
          columns: [],
          primaryKeys: [],
          foreignKeys: [],
          rowCount: 0,
          sizeInBytes: 0,
          comment: row.table_comment
        });
      }

      const table = tables.get(tableName)!;
      if (row.column_name) {
        table.columns.push({
          columnName: row.column_name,
          name: row.column_name,
          type: row.data_type,
          dataType: row.data_type,
          isNullable: row.is_nullable === 'YES',
          nullable: row.is_nullable === 'YES',
          defaultValue: row.column_default,
        });
      }
    });

    return Array.from(tables.values());
  });
}

export async function executeQuery(
  connectionId: string,
  sql: string,
  organizationId: string
): Promise<DatabaseQueryResult> {
  return withConnection(connectionId, organizationId, async (connection) => {
    const startTime = Date.now();
    const result = await connection.query(sql);

    return {
      fields: result.fields.map((field: { name: string; dataTypeID: number; tableID?: number; columnID?: number; format?: string }) => ({
        name: field.name,
        dataType: field.dataTypeID.toString(),
        tableId: field.tableID?.toString(),
        nullable: true,
        columnId: field.columnID?.toString(),
        format: field.format
      })),
      rows: result.rows,
      rowCount: result.rowCount || 0,
      metrics: {
        executionTime: Date.now() - startTime,
        rowCount: result.rowCount || 0,
        error: undefined,
        warning: undefined,
        notice: undefined
      }
    };
  });
}

export async function getTableSchema(
  connection: any,
  tableName: string
): Promise<TableSchema> {
  const columnsQuery = `
    SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      col_description((quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass, c.ordinal_position) as column_comment
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = $1
    ORDER BY c.ordinal_position
  `;

  const primaryKeysQuery = `
    SELECT c.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    JOIN information_schema.columns c 
      ON c.table_name = tc.table_name 
      AND c.column_name = ccu.column_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1
  `;

  const foreignKeysQuery = `
    SELECT
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1
  `;

  const rowCountQuery = `
    SELECT COUNT(*) as count
    FROM "${tableName}"
  `;

  const tableSizeQuery = `
    SELECT pg_total_relation_size($1) as size
  `;

  const [
    columnsResult,
    primaryKeysResult,
    foreignKeysResult,
    rowCountResult,
    tableSizeResult
  ] = await Promise.all([
    connection.query(columnsQuery, [tableName]),
    connection.query(primaryKeysQuery, [tableName]),
    connection.query(foreignKeysQuery, [tableName]),
    connection.query(rowCountQuery),
    connection.query(tableSizeQuery, [tableName])
  ]);

  const columns = columnsResult.rows.map((row: any) => ({
    columnName: row.column_name,
    name: row.column_name,
    type: row.data_type,
    dataType: row.data_type,
    isNullable: row.is_nullable === 'YES',
    nullable: row.is_nullable === 'YES',
    defaultValue: row.column_default,
    comment: row.column_comment
  }));

  const primaryKeys = primaryKeysResult.rows.map((row: any) => row.column_name);
  const foreignKeys = foreignKeysResult.rows.map((row: any) => ({
    columnName: row.column_name,
    referencedTable: row.foreign_table_name,
    referencedColumn: row.foreign_column_name
  }));

  return {
    name: tableName,
    tableName,
    connectionId: connection.id,
    columns,
    primaryKeys,
    foreignKeys,
    rowCount: parseInt(rowCountResult.rows[0].count),
    sizeInBytes: parseInt(tableSizeResult.rows[0].size)
  };
}
