import type { Pool } from 'pg';

interface TableDataOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getTableData(
  pool: Pool,
  tableName: string,
  options: TableDataOptions = {}
) {
  const {
    page = 1,
    pageSize = 10,
    sortBy,
    sortOrder = 'asc'
  } = options;

  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM "${tableName}"`
  );
  const totalRows = parseInt(countResult.rows[0].count);

  // Get data with pagination and sorting
  let query = `SELECT * FROM "${tableName}"`;
  if (sortBy) {
    query += ` ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}`;
  }
  query += ` LIMIT $1 OFFSET $2`;

  const result = await pool.query(query, [pageSize, offset]);

  return {
    data: result.rows,
    totalRows,
    page,
    pageSize
  };
}

export async function executeQuery(
  pool: Pool,
  sql: string,
  params?: any[]
) {
  const result = await pool.query(sql, params);
  return {
    rows: result.rows,
    fields: result.fields
  };
}

export async function insertRow(
  pool: Pool,
  tableName: string,
  data: Record<string, any>
) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateRow(
  pool: Pool,
  tableName: string,
  id: string | number,
  data: Record<string, any>
) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns
    .map((col, i) => `"${col}" = $${i + 1}`)
    .join(', ');

  const query = `
    UPDATE "${tableName}"
    SET ${setClause}
    WHERE id = $${values.length + 1}
    RETURNING *
  `;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
}

export async function deleteRow(
  pool: Pool,
  tableName: string,
  id: string | number
) {
  const query = `
    DELETE FROM "${tableName}"
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
}
