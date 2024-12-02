import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(sql, { schema });

export interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue: any;
  }>;
  primaryKey: string[];
}

export async function getTableSchema(tableName: string): Promise<TableSchema> {
  const columnQuery = `
    SELECT 
      column_name, 
      data_type,
      is_nullable = 'YES' as is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = $1
  `;

  const primaryKeyQuery = `
    SELECT a.attname
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = $1::regclass AND i.indisprimary
  `;

  const [columns, primaryKeys] = await Promise.all([
    sql.unsafe(columnQuery, [tableName]),
    sql.unsafe(primaryKeyQuery, [tableName])
  ]);

  return {
    name: tableName,
    columns: columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable,
      defaultValue: col.column_default
    })),
    primaryKey: primaryKeys.map(pk => pk.attname)
  };
}

export async function getTableData(tableName: string): Promise<Record<string, any>[]> {
  const rows = await sql.unsafe(`SELECT * FROM ${tableName}`);
  return rows;
}

export async function insertRow(
  tableName: string,
  data: Record<string, any>
): Promise<Record<string, any>> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`);

  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const rows = await sql.unsafe(query, values);
  return rows[0];
}

export async function updateRow(
  tableName: string,
  id: number,
  data: Record<string, any>
): Promise<Record<string, any>> {
  const updates = Object.entries(data)
    .map(([key], index) => `${key} = $${index + 2}`)
    .join(', ');

  const values = [id, ...Object.values(data)];

  const query = `
    UPDATE ${tableName}
    SET ${updates}
    WHERE id = $1
    RETURNING *
  `;

  const resp = await sql.unsafe(query, values);
  return resp[0];
}

export async function deleteTableRow(
  tableName: string,
  primaryKey: { column: string; value: any }
) {
  const query = `
    DELETE FROM ${tableName}
    WHERE ${primaryKey.column} = $1
  `;

  await sql.unsafe(query, [primaryKey.value]);
}
