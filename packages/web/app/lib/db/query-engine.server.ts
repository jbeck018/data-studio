import type { Pool, PoolClient, QueryResult as PgQueryResult, QueryResultRow } from 'pg';
import Cursor from 'pg-cursor';
import { QueryError, QueryOptions, QueryResult, QueryMetrics } from '../../types/query';
import { ConnectionManager, type ConnectionConfig } from './connection-manager.server';
import { sqlSanitizer } from '../../utils/sql-sanitizer.server';
import type { StreamingQueryMessage, StreamingQueryOptions } from '../../types/streaming';
import { webSocketManager } from '../../services/websocket.server';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_QUERY_TIMEOUT = 30000; // 30 seconds
const MAX_ROWS = 1000;
const DEFAULT_BATCH_SIZE = 100;

type QueryStreamStatus = 'started' | 'streaming' | 'completed' | 'error' | 'cancelled';

interface QueryResultField {
  name: string;
  dataTypeID: number;
  dataType: string;
}

interface StreamingQueryState {
  client: PoolClient;
  startTime: number;
  totalRows: number;
}

interface StreamingMessageData {
  fields?: QueryResultField[];
  rows?: QueryResultRow[];
  progress?: number;
  totalRows?: number;
  error?: string;
  metrics?: QueryMetrics;
}

interface ActiveQuery {
  client: PoolClient;
  startTime: number;
  totalRows: number;
}

export class QueryEngine {
  private readonly connectionManager: ConnectionManager;
  private activeQueries: Map<string, ActiveQuery>;
  private config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.connectionManager = ConnectionManager.getInstance();
    this.activeQueries = new Map();
    this.config = config;
  }

  private getDataTypeName(dataTypeID: number): string {
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
    if (!normalizedSql.startsWith('select')) return sql;
    if (normalizedSql.includes('limit')) return sql;
    return `${sql} LIMIT ${limit}`;
  }

  private async recordQueryMetrics(
    options: Omit<QueryOptions, 'config'>,
    sql: string,
    startTime: number,
    result: { success: boolean; rowCount?: number; error?: string }
  ): Promise<QueryMetrics> {
    return {
      executionTimeMs: Date.now() - startTime,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      success: result.success,
      rowCount: result.rowCount || 0,
    };
  }

  private mapQueryFields(fields: readonly any[]): QueryResultField[] {
    return fields.map(field => ({
      name: field.name,
      dataTypeID: field.dataTypeID,
      dataType: this.getDataTypeName(field.dataTypeID),
    }));
  }

  private async executeWithTimeout<T extends QueryResultRow>(
    client: PoolClient,
    sql: string,
    timeout: number
  ): Promise<PgQueryResult<T>> {
    await client.query(`SET statement_timeout = ${timeout}`);
    return client.query<T>(sql);
  }

  private createStreamMessage(
    queryId: string,
    status: QueryStreamStatus,
    data?: StreamingMessageData
  ): StreamingQueryMessage {
    return {
      type: 'query_stream',
      queryId,
      status,
      data,
    } as StreamingQueryMessage;
  }

  public async executeQuery(
    sql: string,
    options: Omit<QueryOptions, 'config'>
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const pool = await this.connectionManager.getConnection(this.config);
    const client = await pool.connect();

    try {
      const timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      const maxRows = options.maxRows || MAX_ROWS;
      const sanitizedSql = sqlSanitizer.sanitizeQuery(sql);
      const limitedSql = this.addRowLimit(sanitizedSql, maxRows);

      const result = await this.executeWithTimeout<QueryResultRow>(
        client,
        limitedSql,
        timeout
      );

      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: true,
        rowCount: result.rowCount ?? 0,
      });

      return {
        rows: result.rows,
        fields: this.mapQueryFields(result.fields),
        rowCount: result.rowCount ?? 0,
        metrics,
      };
    } catch (error) {
      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new QueryError(error instanceof Error ? error.message : 'Unknown error', 'EXECUTION_ERROR');
    } finally {
      client.release();
    }
  }

  public async startStreamingQuery(
    sql: string,
    options: Omit<StreamingQueryOptions & QueryOptions, 'config'>
  ): Promise<string> {
    const queryId = uuidv4();
    const pool = await this.connectionManager.getConnection(this.config);
    const client = await pool.connect();

    try {
      const timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      const maxRows = options.maxRows || MAX_ROWS;
      const sanitizedSql = sqlSanitizer.sanitizeQuery(sql);
      const limitedSql = this.addRowLimit(sanitizedSql, maxRows);

      this.activeQueries.set(queryId, {
        client,
        startTime: Date.now(),
        totalRows: 0,
      });

      // Start the streaming query in the background
      this.executeStreamingQuery(
        { ...options, sql: limitedSql },
        client,
        queryId
      ).catch((error) => {
        console.error('Error in streaming query:', error);
      });

      return queryId;
    } catch (error) {
      client.release();
      throw new QueryError(error instanceof Error ? error.message : 'Unknown error', 
        'EXECUTION_ERROR'
      );
    }
  }

  private async executeStreamingQuery(
    options: StreamingQueryOptions & { sql: string; userId: string },
    client: PoolClient,
    queryId: string
  ): Promise<void> {
    const { userId, sql } = options;
    const startTime = Date.now();

    try {
      const cursor = client.query(new Cursor(sql));
      let totalRows = 0;
      let batch: QueryResultRow[] = [];

      const readNextBatch = async () => {
        cursor.read(DEFAULT_BATCH_SIZE, (err, rows) => {
          if (err) {
            webSocketManager.sendToUser(options.userId, {
              type: 'streaming-query',
              queryId,
              status: 'error',
              data: { error: err.message },
            });
            client.release();
            this.activeQueries.delete(queryId);
            return;
          }

          if (rows.length > 0) {
            totalRows += rows.length;
            webSocketManager.sendToUser(options.userId, {
              type: 'streaming-query',
              queryId,
              status: 'streaming',
              data: {
                rows,
                totalRows,
              },
            });
            readNextBatch(); // Continue reading
          } else {
            // No more rows, we're done
            const endTime = Date.now();
            const metrics: QueryMetrics = {
              executionTimeMs: endTime - startTime,
              startTime: new Date(startTime).toISOString(),
              endTime: new Date().toISOString(),
              success: true,
              rowCount: totalRows,
            };

            webSocketManager.sendToUser(options.userId, {
              type: 'streaming-query',
              queryId,
              status: 'completed',
              data: { metrics },
            });

            cursor.close(() => {
              client.release();
              this.activeQueries.delete(queryId);
            });
          }
        });
      };

      // Get field information first
      cursor.read(0, (err, rows, fields) => {
        if (err) {
          webSocketManager.sendToUser(options.userId, {
            type: 'streaming-query',
            queryId,
            status: 'error',
            data: { error: err.message },
          });
          client.release();
          this.activeQueries.delete(queryId);
          return;
        }

        if (fields) {
          webSocketManager.sendToUser(options.userId, {
            type: 'streaming-query',
            queryId,
            status: 'started',
            data: { fields },
          });
        }

        // Start reading rows
        readNextBatch();
      });
    } catch (error) {
      webSocketManager.sendToUser(options.userId, {
        type: 'streaming-query',
        queryId,
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      client.release();
      this.activeQueries.delete(queryId);
    }
  }

  public async cancelStreamingQuery(queryId: string, userId: string): Promise<void> {
    const queryState = this.activeQueries.get(queryId);
    
    try {
      if (queryState) {
        await queryState.client.query('CLOSE query_cursor');
        queryState.client.release();
        this.activeQueries.delete(queryId);
      }

      webSocketManager.sendToUser(userId, this.createStreamMessage(queryId, 'cancelled'));
    } catch (error) {
      console.error(`Failed to cancel query ${queryId}:`, error);
      throw new QueryError('Failed to cancel query', 'EXECUTION_ERROR');
    }
  }
}
