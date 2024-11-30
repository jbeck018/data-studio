import { Pool, PoolConfig } from 'pg';
import { ConnectionManager } from './connection-manager.server';
import { db } from './db.server';
import { queryHistory } from './schema/connections';
import type { QueryResult } from '~/types';
import { createId } from '@paralleldrive/cuid2';

const DEFAULT_QUERY_TIMEOUT = 30000; // 30 seconds
const MAX_ROWS = 1000; // Maximum number of rows to return

export interface QueryOptions {
  timeout?: number;
  maxRows?: number;
  connectionId: string;
  userId: string;
}

export class QueryEngine {
  private static instance: QueryEngine;
  private connectionManager: ConnectionManager;

  private constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  public static getInstance(): QueryEngine {
    if (!QueryEngine.instance) {
      QueryEngine.instance = new QueryEngine();
    }
    return QueryEngine.instance;
  }

  private async recordQuery(
    options: QueryOptions,
    sql: string,
    startTime: number,
    result: { success: boolean; error?: string; rowCount?: number }
  ) {
    const executionTime = Date.now() - startTime;

    await db.insert(queryHistory).values({
      id: createId(),
      connectionId: options.connectionId,
      userId: options.userId,
      query: sql,
      status: result.success ? 'success' : 'error',
      error: result.error,
      executionTimeMs: executionTime.toString(),
      rowCount: result.rowCount?.toString(),
    });
  }

  public async executeQuery(
    sql: string,
    options: QueryOptions
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const pool = await this.connectionManager.getConnection(options.connectionId);
    const client = await pool.connect();

    try {
      // Set statement timeout
      const timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      await client.query(`SET statement_timeout = ${timeout}`);

      // Add row limit if not already present
      const maxRows = options.maxRows || MAX_ROWS;
      const limitedSql = this.addRowLimit(sql, maxRows);

      const result = await client.query(limitedSql);

      await this.recordQuery(options, sql, startTime, {
        success: true,
        rowCount: result.rowCount,
      });

      return {
        rows: result.rows,
        fields: result.fields.map(field => ({
          name: field.name,
          dataTypeID: field.dataTypeID,
        })),
      };
    } catch (error) {
      await this.recordQuery(options, sql, startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release();
    }
  }

  private addRowLimit(sql: string, limit: number): string {
    const normalizedSql = sql.trim().toLowerCase();
    
    // Don't add LIMIT to statements that aren't SELECT queries
    if (!normalizedSql.startsWith('select')) {
      return sql;
    }

    // Don't add LIMIT if it's already present
    if (normalizedSql.includes('limit')) {
      return sql;
    }

    return `${sql} LIMIT ${limit}`;
  }
}
