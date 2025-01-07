import type { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import type { Parser } from 'node-sql-parser';
import type { QueryResult, QueryMetrics, QueryField, DatabaseValue } from '../../types';
import { sanitizeQuery } from '~/utils/sql-sanitizer.server';
import { DatabaseConnection } from './schema';

export interface QueryOptions {
  sql: string;
  timeout?: number;
}

export interface QueryError {
  code: string;
  message: string;
  position?: number;
  detail?: string;
  hint?: string;
}

export class QueryEngine {
  private static instance: QueryEngine;
  private pool: Pool | null = null;
  private client: PoolClient | null = null;
  private parser: Parser;

  private constructor() {
    const { Parser } = require('node-sql-parser');
    this.parser = new Parser();
  }

  public static getInstance(): QueryEngine {
    if (!QueryEngine.instance) {
      QueryEngine.instance = new QueryEngine();
    }
    return QueryEngine.instance;
  }

  async connect(connection: DatabaseConnection): Promise<void> {
    if (connection.type !== 'POSTGRES') {
      throw new Error('Only PostgreSQL connections are supported');
    }

    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: connection.host || 'localhost',
        port: connection.port ? Number.parseInt(connection.port) : 5432,
        database: connection.database || undefined,
        user: connection.username || undefined,
        password: connection.password || undefined,
        ssl: connection.ssl ? { rejectUnauthorized: false } : undefined
      });

      this.pool = pool;
      this.client = await pool.connect();
    } catch (error) {
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async executeQuery(options: QueryOptions): Promise<QueryResult> {
    if (!this.client) {
      throw new Error('Not connected to database');
    }

    const sanitizedQuery = await sanitizeQuery(options.sql);

    try {
      const startTime = Date.now();
      const result = await this.client.query<Record<string, DatabaseValue>>(sanitizedQuery);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const fields: QueryField[] = result.fields.map(field => ({
        name: field.name,
        type: field.dataTypeID.toString(),
        dataType: field.format
      }));

      const metrics: QueryMetrics = {
        executionTimeMs: executionTime,
        bytesProcessed: 0, // Not available in pg
        rowsAffected: result.rowCount || 0
      };

      return {
        columns: [],
        fields,
        rows: result.rows,
        rowCount: result.rowCount || 0,
        metrics,
        executionTime
      };
    } catch (error) {
      const queryError: QueryError = {
        code: error instanceof Error ? error.name : 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        detail: error instanceof Error ? error.stack : undefined
      };
      throw queryError;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async validateQuery(sql: string): Promise<boolean> {
    try {
      this.parser.parse(sql);
      return true;
    } catch {
      return false;
    }
  }
}

export const queryEngine = QueryEngine.getInstance();
