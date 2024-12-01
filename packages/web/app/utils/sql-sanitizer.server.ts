import { format } from "sql-formatter";
import { QueryError } from '~/types/query';

/**
 * Sanitizes table and column names to prevent SQL injection.
 * Only allows alphanumeric characters and underscores.
 * Removes any other characters that could be used for SQL injection.
 */
export function sanitizeTableName(name: string): string {
  if (!name) {
    throw new QueryError('Table or column name cannot be empty', 'INVALID_NAME');
  }

  // Remove any characters that aren't alphanumeric or underscores
  const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '');

  // Ensure the name starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    throw new QueryError('Table or column name must start with a letter', 'INVALID_NAME');
  }

  // Ensure we still have a valid name after sanitization
  if (sanitized.length === 0) {
    throw new QueryError('Invalid table or column name', 'INVALID_NAME');
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

export class SQLSanitizer {
  private readonly allowedTableNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private readonly allowedColumnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private readonly reservedKeywords = new Set([
    'select', 'insert', 'update', 'delete', 'drop', 'truncate', 'alter',
    'create', 'table', 'database', 'schema', 'grant', 'revoke'
  ]);

  public validateTableName(tableName: string): boolean {
    return this.allowedTableNamePattern.test(tableName) && 
           !this.reservedKeywords.has(tableName.toLowerCase());
  }

  public validateColumnName(columnName: string): boolean {
    return this.allowedColumnNamePattern.test(columnName) &&
           !this.reservedKeywords.has(columnName.toLowerCase());
  }

  public escapeValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return `'${value.toString().replace(/'/g, "''")}'`;
  }

  public sanitizeQuery(query: string): string {
    // Remove comments
    query = query.replace(/--.*$/gm, '');
    query = query.replace(/\/\*[\s\S]*?\*\//g, '');

    // Check for dangerous keywords
    const dangerousPatterns = [
      /;\s*drop\s/i,
      /;\s*delete\s/i,
      /;\s*truncate\s/i,
      /;\s*alter\s/i,
      /;\s*grant\s/i,
      /;\s*revoke\s/i,
      /union\s+all/i,
      /union\s+select/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        throw new QueryError('Query contains dangerous operations', 'DANGEROUS_QUERY');
      }
    }

    // Format the query for consistency
    return format(query, {
      language: 'postgresql',
      keywordCase: 'upper',
    });
  }

  public sanitizeTableQuery(tableName: string, filters?: Record<string, any>): string {
    if (!this.validateTableName(tableName)) {
      throw new QueryError('Invalid table name', 'INVALID_TABLE');
    }

    let query = `SELECT * FROM "${tableName}"`;

    if (filters && Object.keys(filters).length > 0) {
      const { clause, values } = createWhereClause(filters);
      query += ` ${clause}`;
      return format(query, { language: 'postgresql' });
    }

    return format(query, { language: 'postgresql' });
  }

  public sanitizeUpdateQuery(
    tableName: string,
    primaryKey: { column: string; value: any },
    data: Record<string, any>
  ): string {
    if (!this.validateTableName(tableName)) {
      throw new QueryError('Invalid table name', 'INVALID_TABLE');
    }

    if (!this.validateColumnName(primaryKey.column)) {
      throw new QueryError('Invalid primary key column name', 'INVALID_COLUMN');
    }

    const setClauses = Object.entries(data)
      .filter(([column]) => this.validateColumnName(column))
      .map(([column, value]) => `"${column}" = ${this.escapeValue(value)}`)
      .join(', ');

    const query = `
      UPDATE "${tableName}"
      SET ${setClauses}
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
      RETURNING *;
    `;

    return format(query, { language: 'postgresql' });
  }

  public sanitizeDeleteQuery(
    tableName: string,
    primaryKey: { column: string; value: any }
  ): string {
    if (!this.validateTableName(tableName)) {
      throw new QueryError('Invalid table name', 'INVALID_TABLE');
    }

    if (!this.validateColumnName(primaryKey.column)) {
      throw new QueryError('Invalid primary key column name', 'INVALID_COLUMN');
    }

    const query = `
      DELETE FROM "${tableName}"
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
      RETURNING *;
    `;

    return format(query, { language: 'postgresql' });
  }

  public sanitizeInsertQuery(tableName: string, data: Record<string, any>): string {
    if (!this.validateTableName(tableName)) {
      throw new QueryError('Invalid table name', 'INVALID_TABLE');
    }

    const columns = Object.keys(data).filter(column => this.validateColumnName(column));
    const values = columns.map(column => this.escapeValue(data[column]));

    const query = `
      INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
      VALUES (${values.join(', ')})
      RETURNING *;
    `;

    return format(query, { language: 'postgresql' });
  }
}

export const sqlSanitizer = new SQLSanitizer();
