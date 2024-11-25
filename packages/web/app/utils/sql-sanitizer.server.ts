import { format } from "sql-formatter";

/**
 * Sanitizes table and column names to prevent SQL injection.
 * Only allows alphanumeric characters and underscores.
 * Removes any other characters that could be used for SQL injection.
 */
export function sanitizeTableName(name: string): string {
  if (!name) {
    throw new Error('Table or column name cannot be empty');
  }

  // Remove any characters that aren't alphanumeric or underscores
  const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '');

  // Ensure the name starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    throw new Error('Table or column name must start with a letter');
  }

  // Ensure we still have a valid name after sanitization
  if (sanitized.length === 0) {
    throw new Error('Invalid table or column name');
  }

  // Convert to lowercase for consistency
  return sanitized.toLowerCase();
}

/**
 * Validates and formats a schema name.
 * By default, uses 'public' schema if none is provided.
 */
export function sanitizeSchemaName(schema: string = 'public'): string {
  const sanitized = sanitizeTableName(schema);
  return sanitized;
}

/**
 * Validates and formats column names for SELECT statements.
 */
export function sanitizeColumnList(columns: string[]): string {
  if (!columns || columns.length === 0) {
    return '*';
  }

  return columns
    .map(col => {
      // Handle special case for *
      if (col === '*') return col;
      return sanitizeTableName(col);
    })
    .join(', ');
}

/**
 * Creates a safe parameterized WHERE clause.
 * Returns both the clause string and the values array for parameterized queries.
 */
export function createWhereClause(
  conditions: Record<string, any>
): { clause: string; values: any[] } {
  const values: any[] = [];
  const clauses: string[] = [];

  Object.entries(conditions).forEach(([key, value], index) => {
    const sanitizedKey = sanitizeTableName(key);
    clauses.push(`${sanitizedKey} = $${index + 1}`);
    values.push(value);
  });

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}

/**
 * Creates a safe ORDER BY clause.
 */
export function createOrderByClause(
  orderBy: { column: string; direction?: 'ASC' | 'DESC' }[]
): string {
  if (!orderBy || orderBy.length === 0) return '';

  const orderClauses = orderBy.map(({ column, direction = 'ASC' }) => {
    const sanitizedColumn = sanitizeTableName(column);
    const sanitizedDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return `${sanitizedColumn} ${sanitizedDirection}`;
  });

  return `ORDER BY ${orderClauses.join(', ')}`;
}

/**
 * Validates and formats a LIMIT clause value.
 */
export function sanitizeLimit(limit?: number): string {
  if (!limit || limit <= 0) return '';
  return `LIMIT ${Math.floor(limit)}`;
}

class SQLSanitizer {
  private readonly allowedTableNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private readonly allowedColumnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  private validateTableName(tableName: string): boolean {
    return this.allowedTableNamePattern.test(tableName);
  }

  private validateColumnName(columnName: string): boolean {
    return this.allowedColumnNamePattern.test(columnName);
  }

  private escapeValue(value: any): string {
    if (value === null) return "NULL";
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    return `'${value.toString().replace(/'/g, "''")}'`;
  }

  sanitizeTableQuery(tableName: string, filters?: Record<string, any>): string {
    if (!this.validateTableName(tableName)) {
      throw new Error("Invalid table name");
    }

    let query = `SELECT * FROM "${tableName}"`;

    if (filters && Object.keys(filters).length > 0) {
      const whereConditions = Object.entries(filters)
        .filter(([column]) => this.validateColumnName(column))
        .map(([column, value]) => `"${column}" = ${this.escapeValue(value)}`)
        .join(" AND ");

      if (whereConditions) {
        query += ` WHERE ${whereConditions}`;
      }
    }

    return format(query + ";");
  }

  sanitizeSchemaQuery(tableName: string): string {
    if (!this.validateTableName(tableName)) {
      throw new Error("Invalid table name");
    }

    const query = `
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
        WHERE tc.table_name = '${tableName}'
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position;
    `;

    return format(query);
  }

  sanitizeUpdateQuery(
    tableName: string,
    primaryKey: { column: string; value: any },
    data: Record<string, any>
  ): string {
    if (!this.validateTableName(tableName)) {
      throw new Error("Invalid table name");
    }

    if (!this.validateColumnName(primaryKey.column)) {
      throw new Error("Invalid primary key column name");
    }

    const setClauses = Object.entries(data)
      .filter(([column]) => this.validateColumnName(column))
      .map(([column, value]) => `"${column}" = ${this.escapeValue(value)}`)
      .join(", ");

    const query = `
      UPDATE "${tableName}"
      SET ${setClauses}
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
      RETURNING *;
    `;

    return format(query);
  }

  sanitizeDeleteQuery(
    tableName: string,
    primaryKey: { column: string; value: any }
  ): string {
    if (!this.validateTableName(tableName)) {
      throw new Error("Invalid table name");
    }

    if (!this.validateColumnName(primaryKey.column)) {
      throw new Error("Invalid primary key column name");
    }

    const query = `
      DELETE FROM "${tableName}"
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)};
    `;

    return format(query);
  }

  sanitizeInsertQuery(tableName: string, data: Record<string, any>): string {
    if (!this.validateTableName(tableName)) {
      throw new Error("Invalid table name");
    }

    const columns = Object.keys(data).filter((column) =>
      this.validateColumnName(column)
    );
    const values = columns.map((column) => this.escapeValue(data[column]));

    const query = `
      INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(", ")})
      VALUES (${values.join(", ")})
      RETURNING *;
    `;

    return format(query);
  }
}

export const sqlSanitizer = new SQLSanitizer();
