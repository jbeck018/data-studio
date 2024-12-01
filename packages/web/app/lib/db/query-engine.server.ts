import { QueryError, QueryOptions, QueryResult, QueryMetrics } from '~/types/query';
import { ConnectionManager } from './connection-manager.server';
import { sqlSanitizer } from '~/utils/sql-sanitizer.server';
import { StreamingQueryMessage, StreamingQueryOptions } from '~/types/streaming';
import { WebSocketManager } from '~/services/websocket.server';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_QUERY_TIMEOUT = 30000; // 30 seconds
const MAX_ROWS = 1000;
const DEFAULT_BATCH_SIZE = 100;

export class QueryEngine {
  private static instance: QueryEngine;
  private readonly connectionManager: ConnectionManager;

  private constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  public static getInstance(): QueryEngine {
    if (!QueryEngine.instance) {
      QueryEngine.instance = new QueryEngine();
    }
    return QueryEngine.instance;
  }

  private getDataTypeName(dataTypeID: number): string {
    // Add mapping for common PostgreSQL data types
    const dataTypes: Record<number, string> = {
      16: 'boolean',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      700: 'real',
      701: 'double precision',
      1043: 'varchar',
      1082: 'date',
      1114: 'timestamp',
      1184: 'timestamptz',
    };
    return dataTypes[dataTypeID] || 'unknown';
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

  private async recordQueryMetrics(
    options: QueryOptions,
    sql: string,
    startTime: number,
    result: { success: boolean; rowCount?: number; error?: string }
  ): Promise<QueryMetrics> {
    const endTime = new Date().toISOString();
    const metrics: QueryMetrics = {
      executionTimeMs: Date.now() - startTime,
      startTime: new Date(startTime).toISOString(),
      endTime,
      success: result.success,
      rowCount: result.rowCount || 0,
    };

    // TODO: Store metrics in database for analysis
    return metrics;
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

      // Validate and sanitize the query
      const sanitizedSql = sqlSanitizer.sanitizeQuery(sql);

      // Add row limit if not already present
      const maxRows = options.maxRows || MAX_ROWS;
      const limitedSql = this.addRowLimit(sanitizedSql, maxRows);

      // Execute the query
      const result = await client.query(limitedSql);

      // Record query metrics
      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: true,
        rowCount: result.rowCount,
      });

      return {
        rows: result.rows,
        fields: result.fields.map(field => ({
          name: field.name,
          dataTypeID: field.dataTypeID,
          dataType: this.getDataTypeName(field.dataTypeID),
        })),
        rowCount: result.rowCount,
        metrics,
      };
    } catch (error) {
      // Record error metrics
      await this.recordQueryMetrics(options, sql, startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release();
    }
  }

  public async executeStreamingQuery(
    sql: string,
    options: QueryOptions & StreamingQueryOptions,
    userId: string
  ): Promise<void> {
    const queryId = uuidv4();
    const startTime = Date.now();
    const pool = await this.connectionManager.getConnection(options.connectionId);
    const client = await pool.connect();
    const wsManager = WebSocketManager.getInstance();

    const sendStreamMessage = (message: StreamingQueryMessage) => {
      wsManager.sendToUser(userId, message);
    };

    try {
      // Set statement timeout
      const timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      await client.query(`SET statement_timeout = ${timeout}`);

      // Validate and sanitize the query
      const sanitizedSql = sqlSanitizer.sanitizeQuery(sql);

      // Add row limit if not already present
      const maxRows = options.maxRows || MAX_ROWS;
      const limitedSql = this.addRowLimit(sanitizedSql, maxRows);

      // Start streaming
      sendStreamMessage({
        type: 'query_stream',
        queryId,
        status: 'started',
      });

      // Execute the query with cursor
      const cursor = await client.query(
        `DECLARE query_cursor CURSOR FOR ${limitedSql}`
      );

      let totalRows = 0;
      let batchCount = 0;
      const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;

      // Get the field information from the cursor
      const fields = cursor.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
        dataType: this.getDataTypeName(field.dataTypeID),
      }));

      sendStreamMessage({
        type: 'query_stream',
        queryId,
        status: 'streaming',
        data: { fields },
      });

      // Fetch rows in batches
      while (true) {
        const result = await client.query(
          `FETCH ${batchSize} FROM query_cursor`
        );

        if (result.rows.length === 0) break;

        totalRows += result.rows.length;
        batchCount++;

        // Send batch to client
        sendStreamMessage({
          type: 'query_stream',
          queryId,
          status: 'streaming',
          data: {
            rows: result.rows,
            progress: options.includeProgress ? (totalRows / maxRows) * 100 : undefined,
            totalRows: options.includeProgress ? maxRows : undefined,
          },
        });

        // Break if we've reached the maximum rows
        if (totalRows >= maxRows) break;
      }

      // Close the cursor
      await client.query('CLOSE query_cursor');

      // Record metrics
      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: true,
        rowCount: totalRows,
      });

      // Send completion message
      sendStreamMessage({
        type: 'query_stream',
        queryId,
        status: 'completed',
        data: { metrics },
      });

    } catch (error) {
      // Record error metrics
      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Send error message
      sendStreamMessage({
        type: 'query_stream',
        queryId,
        status: 'error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          metrics,
        },
      });

      throw error;
    } finally {
      client.release();
    }
  }

  public async cancelStreamingQuery(queryId: string, userId: string): Promise<void> {
    const wsManager = WebSocketManager.getInstance();
    
    try {
      // TODO: Implement query cancellation logic
      // This would involve keeping track of active queries and their associated clients
      // For now, we just notify the client that the query was cancelled
      wsManager.sendToUser(userId, {
        type: 'query_stream',
        queryId,
        status: 'cancelled',
      });
    } catch (error) {
      console.error(`Failed to cancel query ${queryId}:`, error);
      throw new QueryError(
        'Failed to cancel query',
        'EXECUTION_ERROR'
      );
    }
  }
}
