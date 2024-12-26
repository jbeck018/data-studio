import { format } from "sql-formatter";
import { QueryError, QueryErrorCode } from '~/types/query';
import { Parser } from 'node-sql-parser';

const VALID_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const RESERVED_WORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
  'DROP', 'CREATE', 'ALTER', 'TABLE', 'INDEX', 'VIEW',
  'FUNCTION', 'PROCEDURE', 'TRIGGER', 'DATABASE', 'SCHEMA'
]);

const SQL_RESERVED_WORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
  'DROP', 'CREATE', 'ALTER', 'TABLE', 'INDEX', 'VIEW',
  'FUNCTION', 'PROCEDURE', 'TRIGGER', 'DATABASE', 'SCHEMA'
]);

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

const DANGEROUS_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'RENAME',
  'REPLACE',
  'GRANT',
  'REVOKE',
];

/**
 * Validates a table name.
 * @param name The table name to validate.
 */
export function validateTableName(tableName: string): void {
  if (!tableName || typeof tableName !== 'string') {
    throw new QueryError(QueryErrorCode.INVALID_TABLE, 'Table name must be a non-empty string');
  }

  const validTableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!validTableNameRegex.test(tableName)) {
    throw new QueryError(
      QueryErrorCode.INVALID_TABLE,
      'Table name must start with a letter or underscore and contain only letters, numbers, and underscores'
    );
  }

  if (SQL_RESERVED_WORDS.has(tableName.toUpperCase())) {
    throw new QueryError(
      QueryErrorCode.INVALID_TABLE,
      `Table name cannot be a reserved word: ${tableName}`
    );
  }
}

/**
 * Validates a column name.
 * @param name The column name to validate.
 */
export function validateColumnName(columnName: string): void {
  if (!columnName || typeof columnName !== 'string') {
    throw new QueryError(QueryErrorCode.INVALID_COLUMN, 'Column name must be a non-empty string');
  }

  const validColumnNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!validColumnNameRegex.test(columnName)) {
    throw new QueryError(
      QueryErrorCode.INVALID_COLUMN,
      'Column name must start with a letter or underscore and contain only letters, numbers, and underscores'
    );
  }

  if (SQL_RESERVED_WORDS.has(columnName.toUpperCase())) {
    throw new QueryError(
      QueryErrorCode.INVALID_COLUMN,
      `Column name cannot be a reserved word: ${columnName}`
    );
  }
}

/**
 * Sanitizes an identifier by wrapping it in double quotes and escaping any double quotes.
 * @param identifier The identifier to sanitize.
 */
export function sanitizeIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Creates a WHERE clause from the given conditions.
 * @param conditions The conditions to include in the WHERE clause.
 */
export function createWhereClause(conditions: Record<string, any>): string {
  const clauses: string[] = [];
  for (const [column, value] of Object.entries(conditions)) {
    validateColumnName(column);
    if (value === null) {
      clauses.push(`${sanitizeIdentifier(column)} IS NULL`);
    } else if (Array.isArray(value)) {
      const sanitizedValues = value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
      clauses.push(`${sanitizeIdentifier(column)} IN (${sanitizedValues})`);
    } else {
      clauses.push(`${sanitizeIdentifier(column)} = ${typeof value === 'string' ? `'${value}'` : value}`);
    }
  }
  return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
}

/**
 * Creates an ORDER BY clause from the given order by conditions.
 * @param orderBy The order by conditions.
 */
export function createOrderByClause(orderBy: Record<string, 'ASC' | 'DESC'>): string {
  const clauses: string[] = [];
  for (const [column, direction] of Object.entries(orderBy)) {
    validateColumnName(column);
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new QueryError(QueryErrorCode.VALIDATION_ERROR, 'Order by direction must be either ASC or DESC');
    }
    clauses.push(`${sanitizeIdentifier(column)} ${direction}`);
  }
  return clauses.length > 0 ? `ORDER BY ${clauses.join(', ')}` : '';
}

/**
 * Sanitizes a limit value.
 * @param limit The limit value to sanitize.
 */
export function sanitizeLimit(limit: number | string | undefined): number {
  if (limit === undefined) {
    return DEFAULT_LIMIT;
  }

  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  if (isNaN(parsedLimit) || parsedLimit < 0) {
    throw new QueryError(QueryErrorCode.INVALID_LIMIT, 'Limit must be a non-negative number');
  }

  return Math.min(parsedLimit, MAX_LIMIT);
}

/**
 * Sanitizes an offset value.
 * @param offset The offset value to sanitize.
 */
export function sanitizeOffset(offset: number | string | undefined): number {
  if (offset === undefined) {
    return 0;
  }

  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;
  if (isNaN(parsedOffset) || parsedOffset < 0) {
    throw new QueryError(QueryErrorCode.INVALID_OFFSET, 'Offset must be a non-negative number');
  }

  return parsedOffset;
}

/**
 * Creates a SELECT query.
 */
export function createSelectQuery(
  tableName: string,
  columns: string[] = ['*'],
  conditions: Record<string, any> = {},
  orderBy: Record<string, 'ASC' | 'DESC'> = {},
  limit?: number,
  offset?: number
): string {
  validateTableName(tableName);
  columns.forEach(column => {
    if (column !== '*') {
      validateColumnName(column);
    }
  });

  const sanitizedColumns = columns.map(column => 
    column === '*' ? '*' : sanitizeIdentifier(column)
  ).join(', ');

  const whereClause = createWhereClause(conditions);
  const orderByClause = createOrderByClause(orderBy);
  const limitClause = `LIMIT ${sanitizeLimit(limit)}`;
  const offsetClause = offset !== undefined ? `OFFSET ${sanitizeOffset(offset)}` : '';

  return format(`
    SELECT ${sanitizedColumns}
    FROM ${sanitizeIdentifier(tableName)}
    ${whereClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `).trim();
}

/**
 * Sanitizes and validates a SQL query.
 */
export async function sanitizeQuery(sql: string): Promise<string> {
  if (!sql) {
    throw new QueryError(QueryErrorCode.VALIDATION_ERROR, 'SQL query cannot be empty');
  }

  const parser = new Parser();
  let ast;

  try {
    ast = parser.astify(sql);
  } catch (error) {
    throw new QueryError(QueryErrorCode.SYNTAX_ERROR, error instanceof Error ? error.message : 'Invalid SQL syntax');
  }

  // Check for dangerous operations
  if (Array.isArray(ast)) {
    for (const node of ast) {
      if (isUnsafeNode(node)) {
        throw new QueryError(QueryErrorCode.UNSAFE_QUERY, `Query contains dangerous operation: ${node.type}`);
      }
    }
  } else if (isUnsafeNode(ast)) {
    throw new QueryError(QueryErrorCode.UNSAFE_QUERY, `Query contains dangerous operation: ${ast.type}`);
  }

  try {
    validateSqlAst(ast);
  } catch (error) {
    throw new QueryError(QueryErrorCode.VALIDATION_ERROR, error instanceof Error ? error.message : 'Invalid SQL query');
  }

  return formatSql(sql);
}

/**
 * Validates identifiers in a SQL query.
 */
export function validateIdentifiers(sql: string): void {
  const parser = new Parser();
  let ast;

  try {
    ast = parser.astify(sql);
  } catch (error) {
    throw new QueryError(QueryErrorCode.SYNTAX_ERROR, error instanceof Error ? error.message : 'Invalid SQL syntax');
  }

  if (!ast || (Array.isArray(ast) && ast.length === 0)) {
    throw new QueryError(QueryErrorCode.VALIDATION_ERROR, 'Invalid SQL query');
  }

  const node = Array.isArray(ast) ? ast[0] : ast;
  if (node.type !== 'select') {
    throw new QueryError(QueryErrorCode.VALIDATION_ERROR, 'Only SELECT statements are allowed');
  }
}

/**
 * Formats a SQL query.
 */
export function formatSql(sql: string): string {
  return format(sql, {
    language: 'postgresql',
    keywordCase: 'upper',
    linesBetweenQueries: 2,
  });
}

/**
 * Validates a SQL AST.
 */
export function validateSqlAst(ast: any): void {
  if (!ast) {
    throw new QueryError(QueryErrorCode.VALIDATION_ERROR, 'Invalid SQL query');
  }

  const nodes = Array.isArray(ast) ? ast : [ast];
  for (const node of nodes) {
    if (node.type === 'select') {
      if (node.from) {
        for (const table of node.from) {
          if (table.table) {
            validateTableName(table.table);
          }
        }
      }
    }
  }
}

/**
 * Checks if a node contains unsafe operations.
 */
export function isUnsafeNode(node: any): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (node.type && DANGEROUS_KEYWORDS.includes(node.type.toUpperCase())) {
    return true;
  }

  return Object.values(node).some((value: any) => {
    if (Array.isArray(value)) {
      return value.some(item => isUnsafeNode(item));
    }
    return isUnsafeNode(value);
  });
}

export class SQLSanitizer {
  private readonly allowedTableNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private readonly allowedColumnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private readonly reservedKeywords = new Set([
    'select', 'insert', 'update', 'delete', 'drop', 'truncate', 'alter',
    'create', 'table', 'database', 'schema', 'grant', 'revoke'
  ]);

  validateTableName(tableName: string): boolean {
    if (!tableName || !this.allowedTableNamePattern.test(tableName)) {
      throw new QueryError(QueryErrorCode.INVALID_TABLE, `Invalid table name: ${tableName}`);
    }
    return true;
  }

  validateColumnName(columnName: string): boolean {
    if (!columnName || !this.allowedColumnNamePattern.test(columnName)) {
      throw new QueryError(QueryErrorCode.INVALID_COLUMN, `Invalid column name: ${columnName}`);
    }
    return true;
  }

  escapeValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return `'${value.toString().replace(/'/g, "''")}'`;
  }

  sanitizeTableQuery(tableName: string, filters?: Record<string, any>): string {
    this.validateTableName(tableName);
    let query = `SELECT * FROM "${tableName}"`;
    
    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters)
        .map(([column, value]) => {
          this.validateColumnName(column);
          return `"${column}" = ${this.escapeValue(value)}`;
        })
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    return query;
  }

  sanitizeUpdateQuery(
    tableName: string,
    primaryKey: { column: string; value: any },
    data: Record<string, any>
  ): string {
    this.validateTableName(tableName);
    this.validateColumnName(primaryKey.column);

    const setClause = Object.entries(data)
      .map(([column, value]) => {
        this.validateColumnName(column);
        return `"${column}" = ${this.escapeValue(value)}`;
      })
      .join(', ');

    return `
      UPDATE "${tableName}"
      SET ${setClause}
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
    `;
  }

  sanitizeDeleteQuery(
    tableName: string,
    primaryKey: { column: string; value: any }
  ): string {
    this.validateTableName(tableName);
    this.validateColumnName(primaryKey.column);

    return `
      DELETE FROM "${tableName}"
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
    `;
  }

  sanitizeInsertQuery(tableName: string, data: Record<string, any>): string {
    this.validateTableName(tableName);
    
    const columns = Object.keys(data);
    columns.forEach(column => this.validateColumnName(column));
    
    const values = Object.values(data).map(value => this.escapeValue(value));
    
    return `
      INSERT INTO "${tableName}" ("${columns.join('", "')}")
      VALUES (${values.join(', ')})
    `;
  }
}

export const sqlSanitizer = new SQLSanitizer();
