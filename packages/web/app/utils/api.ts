import type { TableDataResponse, TableSchema, QueryResult } from '~/types';
import { pool } from './pool.server';
import { sanitizeTableName } from './sql-sanitizer.server';

interface RawSchemaResponse {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
  primary_key: string[] | null;
}

export async function fetchSchema(): Promise<TableSchema[]> {
  console.log('Attempting to fetch schema...');
  const client = await pool.connect();
  try {
    console.log('Connected to database, executing query...');
    const result = await client.query<{
      table_name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        defaultValue?: string;
      }>;
      primary_key: string[] | null;
      row_count: string;
      size_bytes: string;
    }>(`
      WITH table_sizes AS (
        SELECT 
          n.nspname as schema_name,
          c.relname as table_name,
          pg_total_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) as total_bytes,
          c.reltuples::bigint as row_estimate
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
          AND n.nspname = 'public'
      )
      SELECT 
        t.table_name,
        array_agg(
          json_build_object(
            'name', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable = 'YES',
            'defaultValue', c.column_default
          )
        ) as columns,
        array_agg(
          CASE WHEN tc.constraint_type = 'PRIMARY KEY' 
          THEN c.column_name 
          ELSE NULL 
          END
        ) FILTER (WHERE tc.constraint_type = 'PRIMARY KEY') as primary_key,
        COALESCE(ts.row_estimate::text, '0') as row_count,
        COALESCE(ts.total_bytes::text, '0') as size_bytes
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.table_constraints tc 
        ON t.table_name = tc.table_name 
        AND t.table_schema = tc.table_schema
        AND tc.constraint_type = 'PRIMARY KEY'
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND c.column_name = kcu.column_name
      LEFT JOIN table_sizes ts ON t.table_name = ts.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name, ts.row_estimate, ts.total_bytes
    `);

    console.log('Query executed successfully, found tables:', result.rows.length);
    return result.rows.map(row => ({
      name: row.table_name,
      columns: row.columns,
      primaryKey: row.primary_key ?? undefined,
      rowCount: parseInt(row.row_count || '0', 10),
      sizeInBytes: parseInt(row.size_bytes || '0', 10)
    }));
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  } finally {
    console.log('Releasing database connection');
    client.release();
  }
}

export async function fetchTableData(
  tableName: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<TableDataResponse> {
  const client = await pool.connect();
  try {
    let query = `SELECT * FROM ${sanitizeTableName(tableName)}`;
    
    if (sortBy) {
      query += ` ORDER BY ${sanitizeTableName(sortBy)} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    }
    
    const result = await client.query(query);

    return {
      data: result.rows,
      totalRows: result.rows.length
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
      fields: result.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      }))
    };
  } finally {
    client.release();
  }
}

export async function updateTableSchema(
  tableName: string,
  schema: TableSchema
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current schema
    const currentSchema = (await fetchSchema()).find(s => s.name === tableName);
    if (!currentSchema) {
      throw new Error(`Table ${tableName} not found`);
    }

    // Find columns to add, modify, and remove
    const currentColumns = new Map(currentSchema.columns.map(c => [c.name, c]));
    const newColumns = new Map(schema.columns.map(c => [c.name, c]));

    // Columns to add
    for (const [name, column] of newColumns) {
      if (!currentColumns.has(name)) {
        await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          ADD COLUMN ${sanitizeTableName(name)} ${column.type}
          ${column.nullable ? '' : 'NOT NULL'}
          ${column.defaultValue ? `DEFAULT ${column.defaultValue}` : ''}
        `);
      }
    }

    // Columns to modify
    for (const [name, column] of newColumns) {
      const currentColumn = currentColumns.get(name);
      if (currentColumn) {
        // Modify column type if different
        if (currentColumn.type !== column.type) {
          await client.query(`
            ALTER TABLE ${sanitizeTableName(tableName)}
            ALTER COLUMN ${sanitizeTableName(name)}
            TYPE ${column.type}
            USING ${sanitizeTableName(name)}::${column.type}
          `);
        }

        // Modify nullable constraint if different
        if (currentColumn.nullable !== column.nullable) {
          await client.query(`
            ALTER TABLE ${sanitizeTableName(tableName)}
            ALTER COLUMN ${sanitizeTableName(name)}
            ${column.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'}
          `);
        }

        // Modify default value if different
        if (currentColumn.defaultValue !== column.defaultValue) {
          if (column.defaultValue) {
            await client.query(`
              ALTER TABLE ${sanitizeTableName(tableName)}
              ALTER COLUMN ${sanitizeTableName(name)}
              SET DEFAULT ${column.defaultValue}
            `);
          } else {
            await client.query(`
              ALTER TABLE ${sanitizeTableName(tableName)}
              ALTER COLUMN ${sanitizeTableName(name)}
              DROP DEFAULT
            `);
          }
        }
      }
    }

    // Columns to remove
    for (const [name] of currentColumns) {
      if (!newColumns.has(name)) {
        await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          DROP COLUMN ${sanitizeTableName(name)}
        `);
      }
    }

    // Update primary key if changed
    if (JSON.stringify(currentSchema.primaryKey) !== JSON.stringify(schema.primaryKey)) {
      // Drop existing primary key
      await client.query(`
        DO $$ 
        BEGIN 
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = '${tableName}'
            AND constraint_type = 'PRIMARY KEY'
          ) THEN
            EXECUTE (
              SELECT 'ALTER TABLE ' || quote_ident('${tableName}') || 
                     ' DROP CONSTRAINT ' || quote_ident(constraint_name)
              FROM information_schema.table_constraints
              WHERE table_name = '${tableName}'
              AND constraint_type = 'PRIMARY KEY'
            );
          END IF;
        END $$;
      `);

      // Add new primary key if specified
      if (schema.primaryKey && schema.primaryKey.length > 0) {
        const primaryKeyColumns = schema.primaryKey
          .map(col => sanitizeTableName(col))
          .join(', ');
        await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          ADD PRIMARY KEY (${primaryKeyColumns})
        `);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function createTableRow(
  tableName: string,
  data: Record<string, any>
): Promise<void> {
  const client = await pool.connect();
  try {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${sanitizeTableName(tableName)} 
      (${columns.map(sanitizeTableName).join(', ')})
      VALUES (${placeholders})
    `;
    
    await client.query(query, values);
  } catch (error) {
    console.error('Error creating row:', error);
    throw error;
  } finally {
    client.release();
  }
}
