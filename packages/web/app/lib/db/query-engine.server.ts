import { Pool, PoolClient } from 'pg';
import { QueryError, QueryErrorCode, QueryOptions, QueryResult } from '~/types/query';
import { Parser } from 'node-sql-parser';
import { BaseConnection } from './connection-handlers.server';
import { sanitizeQuery } from '~/utils/sql-sanitizer.server';

export class QueryEngine {
  private static instance: QueryEngine;
  private pool: Pool | null = null;
  private client: PoolClient | null = null;
  private parser: Parser;

  private constructor() {
    this.parser = new Parser();
  }

  public static getInstance(): QueryEngine {
    if (!QueryEngine.instance) {
      QueryEngine.instance = new QueryEngine();
    }
    return QueryEngine.instance;
  }

  async connect(connection: BaseConnection): Promise<void> {
    if (connection.type !== 'POSTGRES') {
      throw new QueryError('Only PostgreSQL connections are supported', QueryErrorCode.CONNECTION_ERROR);
    }

    try {
      const pool = new Pool(connection.config);
      this.pool = pool;
      this.client = await pool.connect();
    } catch (error) {
      throw new QueryError(
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        QueryErrorCode.CONNECTION_ERROR
      );
    }
  }

  async executeQuery(options: QueryOptions): Promise<QueryResult> {
    if (!this.client) {
      throw new QueryError('Not connected to database', QueryErrorCode.CONNECTION_NOT_FOUND);
    }

    try {
      const { sql } = options;
      const sanitizedQuery = await sanitizeQuery(sql);
      
      const startTime = Date.now();
      const result = await this.client.query(sanitizedQuery);
      const endTime = Date.now();

      return {
        fields: result.fields.map(f => ({
          name: f.name,
          dataType: f.dataTypeID?.toString() || 'unknown'
        })),
        rows: result.rows,
        rowCount: result.rowCount || 0,
        metrics: {
          executionTime: endTime - startTime,
          rowCount: result.rowCount || 0,
          success: true
        }
      };
    } catch (error) {
      throw new QueryError(
        `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        QueryErrorCode.EXECUTION_ERROR,
        {
          executionTime: 0,
          rowCount: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.release();
      this.client = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const queryEngine = QueryEngine.getInstance();
