import { pool } from "./pool.server";
import type { TableSchema } from "~/types";

export async function getTableSchema(tableName: string): Promise<TableSchema> {
  const client = await pool.connect();
  try {
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        CASE 
          WHEN pk.constraint_type = 'PRIMARY KEY' THEN true
          ELSE false
        END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;

    const { rows } = await client.query(columnsQuery, [tableName]);

    const columns = rows.map((row) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      defaultValue: row.column_default,
    }));

    const primaryKey = rows
      .filter(row => row.is_primary_key)
      .map(row => row.column_name);

    return {
      name: tableName,
      columns,
      primaryKey: primaryKey.length > 0 ? primaryKey : undefined,
    };
  } finally {
    client.release();
  }
}

export async function getTableData(tableName: string): Promise<any[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SELECT * FROM ${tableName}`);
    return rows;
  } finally {
    client.release();
  }
}

export async function updateTableRow(
  tableName: string,
  primaryKey: { column: string; value: any },
  data: Record<string, any>
) {
  const client = await pool.connect();
  try {
    const setClauses = Object.entries(data)
      .map(([column, _], index) => `${column} = $${index + 1}`)
      .join(", ");

    const values = [...Object.values(data), primaryKey.value];
    const query = `
      UPDATE ${tableName}
      SET ${setClauses}
      WHERE ${primaryKey.column} = $${values.length}
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    return rows[0];
  } finally {
    client.release();
  }
}

export async function deleteTableRow(
  tableName: string,
  primaryKey: { column: string; value: any }
) {
  const client = await pool.connect();
  try {
    const query = `
      DELETE FROM ${tableName}
      WHERE ${primaryKey.column} = $1
    `;

    await client.query(query, [primaryKey.value]);
  } finally {
    client.release();
  }
}

export async function insertTableRow(
  tableName: string,
  data: Record<string, any>
) {
  const client = await pool.connect();
  try {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const values = Object.values(data);

    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    return rows[0];
  } finally {
    client.release();
  }
}
