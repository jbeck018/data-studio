import type { Pool } from 'pg';

interface Schema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue: string | null;
  }>;
  primaryKey: string[];
  foreignKeys: Array<{
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
  }>;
}

export async function getDatabaseSchema(pool: Pool): Promise<Schema[]> {
  const result = await pool.query(`
    SELECT 
      t.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      tc.constraint_type,
      kcu.referenced_table_name,
      kcu.referenced_column_name
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN information_schema.key_column_usage kcu ON t.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    WHERE t.table_schema = 'public'
    ORDER BY t.table_name, c.ordinal_position;
  `);

  const schema = new Map<string, Schema>();

  result.rows.forEach(row => {
    if (!schema.has(row.table_name)) {
      schema.set(row.table_name, {
        name: row.table_name,
        columns: [],
        primaryKey: [],
        foreignKeys: [],
      });
    }

    const table = schema.get(row.table_name)!;

    // Add column if not already added
    if (!table.columns.find(col => col.name === row.column_name)) {
      table.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
      });
    }

    // Add primary key
    if (row.constraint_type === 'PRIMARY KEY') {
      table.primaryKey.push(row.column_name);
    }

    // Add foreign key
    if (row.constraint_type === 'FOREIGN KEY') {
      table.foreignKeys.push({
        columns: [row.column_name],
        referencedTable: row.referenced_table_name,
        referencedColumns: [row.referenced_column_name],
      });
    }
  });

  return Array.from(schema.values());
}

export async function getTableSchema(pool: Pool, tableName: string): Promise<Schema> {
  const result = await pool.query(`
    SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      tc.constraint_type,
      kcu.referenced_table_name,
      kcu.referenced_column_name
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    WHERE c.table_name = $1 AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
  `, [tableName]);

  const schema: Schema = {
    name: tableName,
    columns: [],
    primaryKey: [],
    foreignKeys: [],
  };

  result.rows.forEach(row => {
    // Add column if not already added
    if (!schema.columns.find(col => col.name === row.column_name)) {
      schema.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
      });
    }

    // Add primary key
    if (row.constraint_type === 'PRIMARY KEY') {
      schema.primaryKey.push(row.column_name);
    }

    // Add foreign key
    if (row.constraint_type === 'FOREIGN KEY') {
      schema.foreignKeys.push({
        columns: [row.column_name],
        referencedTable: row.referenced_table_name,
        referencedColumns: [row.referenced_column_name],
      });
    }
  });

  return schema;
}
