import { format } from "sql-formatter";

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

    return format(query + " LIMIT 1000;");
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
