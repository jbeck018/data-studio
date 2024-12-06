import type { Pool, PoolClient, QueryResult as PgQueryResult, QueryResultRow } from 'pg';
import Cursor from 'pg-cursor';
import { QueryError, QueryOptions, QueryResult, QueryMetrics } from '../../types/query';
import { ConnectionManager, type ConnectionConfig } from './connection-manager.server';
import { sqlSanitizer } from '../../utils/sql-sanitizer.server';
import type { StreamingQueryMessage, StreamingQueryOptions } from '../../types/streaming';
import { webSocketManager } from '../../services/websocket.server';
import { v4 as uuidv4 } from 'uuid';
import { parse as parseSQL } from 'node-sql-parser';

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

interface DatabaseAlias {
  alias: string;
  connectionId: string;
}

interface CrossDatabaseQueryOptions extends QueryOptions {
  databaseAliases?: DatabaseAlias[];
}

interface DataTypeMapping {
  sourceType: string;
  targetType: string;
  conversionFn?: (value: any) => any;
}

interface JoinOptimizationInfo {
  sourceTable: string;
  targetTable: string;
  joinCondition: string;
  estimatedRows: number;
}

export class QueryEngine {
  private static instance: QueryEngine;
  private readonly connectionManager: ConnectionManager;
  private activeQueries: Map<string, ActiveQuery>;
  private activeConnections: Map<string, PoolClient>;
  private config: ConnectionConfig;
  private dataTypeCompatibilityMap: Map<string, Set<string>> = new Map();

  private constructor(config: ConnectionConfig) {
    this.connectionManager = ConnectionManager.getInstance();
    this.activeQueries = new Map();
    this.activeConnections = new Map();
    this.config = config;
    this.initializeDataTypeCompatibilityMap();
  }

  private initializeDataTypeCompatibilityMap(): void {
    // Initialize the data type compatibility map
    const numericTypes = new Set(['integer', 'bigint', 'decimal', 'numeric', 'real', 'double precision']);
    const textTypes = new Set(['char', 'varchar', 'text', 'string']);
    const dateTypes = new Set(['date', 'timestamp', 'datetime']);
    const booleanTypes = new Set(['boolean', 'bool']);

    this.dataTypeCompatibilityMap.set('numeric', numericTypes);
    this.dataTypeCompatibilityMap.set('text', textTypes);
    this.dataTypeCompatibilityMap.set('date', dateTypes);
    this.dataTypeCompatibilityMap.set('boolean', booleanTypes);
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

  private async getConnectionForAlias(alias: string, databaseAliases: DatabaseAlias[]): Promise<PoolClient> {
    const dbAlias = databaseAliases.find(da => da.alias === alias);
    if (!dbAlias) {
      throw new Error(`Database alias '${alias}' not found`);
    }

    const cachedConnection = this.activeConnections.get(dbAlias.connectionId);
    if (cachedConnection) {
      return cachedConnection;
    }

    const connection = await this.connectionManager.getConnection({
      ...this.config,
      id: dbAlias.connectionId,
    });
    const client = await connection.connect();
    this.activeConnections.set(dbAlias.connectionId, client);
    return client;
  }

  private async parseCrossDatabaseQuery(sql: string, databaseAliases?: DatabaseAlias[]): Promise<string> {
    if (!databaseAliases || databaseAliases.length === 0) {
      return sql;
    }

    try {
      const ast = parseSQL(sql);
      // Handle database aliases in the AST
      // This is a simplified example - you'll need to implement the full logic
      // to handle all SQL constructs (JOIN, subqueries, etc.)
      if (Array.isArray(ast)) {
        for (const statement of ast) {
          this.processAliasesInStatement(statement, databaseAliases);
        }
      } else {
        this.processAliasesInStatement(ast, databaseAliases);
      }
      
      return sql; // Return modified SQL
    } catch (error) {
      console.error('Error parsing SQL:', error);
      throw new Error('Failed to parse cross-database query');
    }
  }

  private processAliasesInStatement(statement: any, databaseAliases: DatabaseAlias[]): void {
    if (statement.type === 'select') {
      // Process FROM clause
      if (statement.from) {
        for (const table of statement.from) {
          const alias = this.extractDatabaseAlias(table.table);
          if (alias) {
            const dbAlias = databaseAliases.find(da => da.alias === alias.database);
            if (!dbAlias) {
              throw new Error(`Database alias '${alias.database}' not found`);
            }
            // Update table reference with fully qualified name
            table.table = `${dbAlias.connectionId}.${alias.table}`;
          }
        }
      }

      // Process JOINs
      if (statement.join) {
        for (const join of statement.join) {
          const alias = this.extractDatabaseAlias(join.table);
          if (alias) {
            const dbAlias = databaseAliases.find(da => da.alias === alias.database);
            if (!dbAlias) {
              throw new Error(`Database alias '${alias.database}' not found`);
            }
            // Update join table reference
            join.table = `${dbAlias.connectionId}.${alias.table}`;
          }
        }
      }
    }
  }

  private extractDatabaseAlias(tableName: string): { database: string; table: string } | null {
    const parts = tableName.split('.');
    if (parts.length === 2) {
      return { database: parts[0], table: parts[1] };
    }
    return null;
  }

  private async startTransaction(clients: PoolClient[]): Promise<void> {
    await Promise.all(clients.map(client => client.query('BEGIN')));
  }

  private async commitTransaction(clients: PoolClient[]): Promise<void> {
    await Promise.all(clients.map(client => client.query('COMMIT')));
  }

  private async rollbackTransaction(clients: PoolClient[]): Promise<void> {
    await Promise.all(clients.map(client => client.query('ROLLBACK')));
  }

  private checkDataTypeCompatibility(
    sourceType: string,
    targetType: string,
    sourceDb: string,
    targetDb: string
  ): { compatible: boolean; conversionFn?: (value: any) => any } {
    const sourceMapping = this.dataTypeCompatibilityMap.get(sourceType);
    if (!sourceMapping) return { compatible: false };

    const mapping = sourceMapping.has(targetType);
    if (!mapping) return { compatible: false };

    return {
      compatible: true,
    };
  }

  private async optimizeJoinOrder(
    joinInfo: JoinOptimizationInfo[],
    clients: Map<string, PoolClient>
  ): Promise<JoinOptimizationInfo[]> {
    // Get table statistics for each table
    const tableStats = await Promise.all(
      joinInfo.map(async (info) => {
        const [dbAlias, tableName] = info.sourceTable.split('.');
        const client = clients.get(dbAlias);
        if (!client) throw new Error(`No client found for database ${dbAlias}`);

        const result = await client.query(`
          SELECT reltuples::bigint AS estimate
          FROM pg_class
          WHERE relname = $1
        `, [tableName]);

        return {
          ...info,
          estimatedRows: result.rows[0]?.estimate || 1000,
        };
      })
    );

    // Sort joins by estimated row count (ascending)
    return tableStats.sort((a, b) => a.estimatedRows - b.estimatedRows);
  }

  private async executeDistributedQuery(
    sql: string,
    clients: Map<string, PoolClient>,
    options: QueryOptions
  ): Promise<QueryResult> {
    const clientsList = Array.from(clients.values());
    
    try {
      // Start transaction on all databases
      await this.startTransaction(clientsList);

      // Parse and validate the query
      const ast = parseSQL(sql);
      if (Array.isArray(ast)) {
        throw new Error('Multi-statement queries are not supported in distributed mode');
      }

      // Analyze and optimize join order
      const joinInfo = this.extractJoinInfo(ast);
      const optimizedJoins = await this.optimizeJoinOrder(joinInfo, clients);

      // Execute the optimized query
      const result = await this.executeOptimizedQuery(optimizedJoins, clients, options);

      // Commit the transaction
      await this.commitTransaction(clientsList);

      return result;
    } catch (error) {
      // Rollback on error
      await this.rollbackTransaction(clientsList);
      throw error;
    }
  }

  private async executeOptimizedQuery(
    joins: JoinOptimizationInfo[],
    clients: Map<string, PoolClient>,
    options: QueryOptions
  ): Promise<QueryResult> {
    let result: QueryResult = { rows: [], fields: [], rowCount: 0 };
    
    // Execute each join in the optimized order
    for (const join of joins) {
      const [sourceDbAlias, sourceTable] = join.sourceTable.split('.');
      const [targetDbAlias, targetTable] = join.targetTable.split('.');
      
      const sourceClient = clients.get(sourceDbAlias);
      const targetClient = clients.get(targetDbAlias);
      
      if (!sourceClient || !targetClient) {
        throw new Error('Missing database client for join operation');
      }

      // Check data type compatibility for joined columns
      const sourceColumns = await this.getColumnTypes(sourceClient, sourceTable);
      const targetColumns = await this.getColumnTypes(targetClient, targetTable);
      
      for (const [columnName, sourceType] of Object.entries(sourceColumns)) {
        const targetType = targetColumns[columnName];
        if (targetType) {
          const { compatible } = this.checkDataTypeCompatibility(
            sourceType,
            targetType,
            sourceDbAlias,
            targetDbAlias
          );
          
          if (!compatible) {
            throw new Error(
              `Incompatible data types for join column ${columnName}: ${sourceType} and ${targetType}`
            );
          }
        }
      }

      // Execute the join
      const joinQuery = this.buildJoinQuery(join, result.rows);
      const joinResult = await sourceClient.query(joinQuery);
      
      // Merge results
      result = this.mergeResults(result, joinResult);
    }

    return result;
  }

  private async getColumnTypes(
    client: PoolClient,
    tableName: string
  ): Promise<Record<string, string>> {
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
    `, [tableName]);

    return result.rows.reduce((acc, row) => {
      acc[row.column_name] = row.data_type;
      return acc;
    }, {} as Record<string, string>);
  }

  private extractJoinInfo(ast: any): JoinOptimizationInfo[] {
    const joins: JoinOptimizationInfo[] = [];
    
    if (ast.type === 'select' && ast.join) {
      for (const join of ast.join) {
        joins.push({
          sourceTable: join.table,
          targetTable: ast.from[0].table,
          joinCondition: this.extractJoinCondition(join),
          estimatedRows: 0,
        });
      }
    }
    
    return joins;
  }

  private extractJoinCondition(join: any): string {
    if (join.on) {
      return this.formatCondition(join.on);
    }
    return '';
  }

  private formatCondition(condition: any): string {
    if (condition.type === 'binary_expr') {
      return `${condition.left.value} ${condition.operator} ${condition.right.value}`;
    }
    return '';
  }

  private buildJoinQuery(
    join: JoinOptimizationInfo,
    previousResults: any[]
  ): string {
    if (previousResults.length === 0) {
      return `
        SELECT * FROM ${join.sourceTable}
        JOIN ${join.targetTable} ON ${join.joinCondition}
      `;
    }

    const values = previousResults
      .map((row) => `(${Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')})`)
      .join(', ');

    return `
      WITH previous_results AS (
        SELECT * FROM (VALUES ${values}) AS t(${Object.keys(previousResults[0]).join(', ')})
      )
      SELECT * FROM previous_results
      JOIN ${join.sourceTable} ON ${join.joinCondition}
    `;
  }

  private mergeResults(result1: QueryResult, result2: QueryResult): QueryResult {
    return {
      rows: [...result1.rows, ...result2.rows],
      fields: [...result1.fields, ...result2.fields],
      rowCount: (result1.rowCount || 0) + (result2.rowCount || 0),
    };
  }

  public async executeQuery(
    sql: string,
    options: Omit<CrossDatabaseQueryOptions, 'config'>
  ): Promise<QueryResult> {
    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      const timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      const maxRows = options.maxRows || MAX_ROWS;
      const sanitizedSql = sqlSanitizer.sanitizeQuery(sql);
      
      // Parse and modify the query for cross-database support
      const modifiedSql = await this.parseCrossDatabaseQuery(sanitizedSql, options.databaseAliases);
      const limitedSql = this.addRowLimit(modifiedSql, maxRows);

      // If using database aliases, we need to handle distributed queries
      if (options.databaseAliases && options.databaseAliases.length > 0) {
        // Get the main connection for the primary database
        const mainConnection = await this.connectionManager.getConnection({
          ...this.config,
          id: options.databaseAliases[0].connectionId,
        });
        client = await mainConnection.connect();

        // Set up connections for all referenced databases
        await Promise.all(
          options.databaseAliases.map(async (alias) => {
            await this.getConnectionForAlias(alias.alias, options.databaseAliases!);
          })
        );

        // Execute the distributed query
        const result = await this.executeDistributedQuery(limitedSql, this.activeConnections, options);

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
      } else {
        // Single database query
        const pool = await this.connectionManager.getConnection(this.config);
        client = await pool.connect();

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
      }
    } catch (error) {
      const metrics = await this.recordQueryMetrics(options, sql, startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new QueryError({
        message: error instanceof Error ? error.message : 'Unknown error',
        sql,
        metrics,
      });
    } finally {
      if (client) {
        client.release();
      }
      // Clean up any additional connections
      for (const [_, conn] of this.activeConnections) {
        await conn.release();
      }
      this.activeConnections.clear();
    }
  }

  public async startStreamingQuery(
    sql: string,
    options: Omit<StreamingQueryOptions & CrossDatabaseQueryOptions, 'config'>
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
