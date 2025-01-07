import pg from 'pg';
import type { ProcessedSchemaTable, TableNodeData, Column } from '../types/schema';

export interface SchemaInfo {
  table_name: string;
  column_name?: string;
  description: string;
}

export interface QueryPattern {
  pattern_text: string;
  sql_template: string;
  description: string;
  similarity: number;
  metadata?: string;
}

export interface PgAIConfig {
  modelName?: string;
  embeddingDimension?: number;
  similarityThreshold?: number;
}

const DEFAULT_CONFIG: Required<PgAIConfig> = {
  modelName: 'openai',
  embeddingDimension: 1536, // OpenAI's embedding dimension
  similarityThreshold: 0.7,
};

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    references?: {
      table: string;
      column: string;
    };
  }>;
}

export interface RelationshipInfo {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  relationType: RelationType;
}

/**
 * Manages interactions with pg_ai extension for embeddings and vector search
 */
export class PgAI {
  private pool: pg.Pool;
  private config: Required<PgAIConfig>;

  constructor(pool: pg.Pool, config: PgAIConfig = {}) {
    this.pool = pool;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initializes pg_ai extension and required tables
   */
  public async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create pg_ai extension if not exists
      await client.query('CREATE EXTENSION IF NOT EXISTS pg_ai');

      // Create table for storing schema embeddings
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_embeddings (
          id SERIAL PRIMARY KEY,
          table_name TEXT NOT NULL,
          column_name TEXT,
          description TEXT NOT NULL,
          embedding vector(${this.config.embeddingDimension}),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create table for storing query patterns
      await client.query(`
        CREATE TABLE IF NOT EXISTS query_patterns (
          id SERIAL PRIMARY KEY,
          pattern_text TEXT NOT NULL UNIQUE,
          sql_template TEXT NOT NULL,
          description TEXT,
          metadata JSONB,
          embedding vector(${this.config.embeddingDimension}),
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create table for query history
      await client.query(`
        CREATE TABLE IF NOT EXISTS query_history (
          id SERIAL PRIMARY KEY,
          natural_query TEXT,
          sql_query TEXT NOT NULL,
          successful BOOLEAN DEFAULT true,
          execution_time INTERVAL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } finally {
      client.release();
    }
  }

  /**
   * Updates schema embeddings based on current database schema
   */
  public async updateSchemaEmbeddings(
    tables: ProcessedSchemaTable[],
    relationships: RelationshipInfo[]
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Clear existing embeddings
      await client.query('TRUNCATE schema_embeddings');

      // Generate and store embeddings for each table and column
      for (const table of tables) {
        // Table description embedding
        const tableDesc = this.generateTableDescription(table);
        await client.query(
          'INSERT INTO schema_embeddings (table_name, description, embedding) VALUES ($1, $2, pg_ai_embed($2))',
          [table.data.name, tableDesc]
        );

        // Column description embeddings
        for (const column of table.data.columns) {
          const columnDesc = this.generateColumnDescription(table.data.name, column);
          await client.query(
            'INSERT INTO schema_embeddings (table_name, column_name, description, embedding) VALUES ($1, $2, $3, pg_ai_embed($3))',
            [table.data.name, column.name, columnDesc]
          );
        }
      }

      // Generate and store embeddings for relationships
      for (const rel of relationships) {
        const relDesc = this.generateRelationshipDescription(
          rel.sourceTable,
          rel.sourceColumn,
          rel.targetTable,
          rel.targetColumn,
          rel.relationType
        );
        
        await client.query(
          'INSERT INTO schema_embeddings (table_name, description, embedding) VALUES ($1, $2, pg_ai_embed($2))',
          [`${rel.sourceTable}_${rel.targetTable}_rel`, relDesc]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Finds schema information relevant to a natural language query
   */
  public async findRelevantSchemaInfo(query: string): Promise<SchemaInfo[]> {
    const result = await this.pool.query<SchemaInfo>(`
      SELECT table_name, column_name, description
      FROM schema_embeddings
      WHERE cosine_similarity(embedding, pg_ai_embed($1)) > $2
      ORDER BY cosine_similarity(embedding, pg_ai_embed($1)) DESC
      LIMIT 5
    `, [query, this.config.similarityThreshold]);

    return result.rows;
  }

  /**
   * Finds query patterns similar to the input query
   */
  public async findSimilarQueryPatterns(query: string): Promise<QueryPattern[]> {
    const result = await this.pool.query<QueryPattern & { metadata: string }>(`
      SELECT 
        pattern_text,
        sql_template,
        description,
        cosine_similarity(embedding, pg_ai_embed($1)) as similarity,
        metadata::text as metadata
      FROM query_patterns
      WHERE cosine_similarity(embedding, pg_ai_embed($1)) > $2
      ORDER BY cosine_similarity(embedding, pg_ai_embed($1)) DESC
      LIMIT 3
    `, [query, this.config.similarityThreshold]);

    return result.rows.map(row => ({
      pattern_text: row.pattern_text,
      sql_template: row.sql_template,
      description: row.description,
      similarity: row.similarity,
      metadata: row.metadata
    }));
  }

  /**
   * Records a query execution in history
   */
  public async recordQuery(
    naturalQuery: string,
    sqlQuery: string,
    successful: boolean,
    executionTime?: number
  ): Promise<void> {
    await this.pool.query(
      'INSERT INTO query_history (natural_query, sql_query, successful, execution_time) VALUES ($1, $2, $3, $4)',
      [naturalQuery, sqlQuery, successful, executionTime ? `${executionTime} milliseconds` : null]
    );
  }

  private generateTableDescription(table: ProcessedSchemaTable): string {
    const columnList = table.data.columns
      .map(col => `${col.name} (${col.type}${col.isPrimaryKey ? ', primary key' : ''}${col.isForeignKey ? ', foreign key' : ''})`)
      .join(', ');
    
    return `Table ${table.data.name} with columns: ${columnList}`;
  }

  private generateColumnDescription(
    tableName: string, 
    column: Column
  ): string {
    let desc = `Column ${column.name} in table ${tableName} of type ${column.type}`;
    if (column.isPrimaryKey) desc += ', serves as the primary key';
    if (column.isForeignKey && column.references) {
      desc += `, references ${column.references.table}.${column.references.column}`;
    }
    if (!column.nullable) desc += ', cannot be null';
    return desc;
  }

  private generateRelationshipDescription(
    sourceTable: string,
    sourceColumn: string,
    targetTable: string,
    targetColumn: string,
    relationType: RelationType
  ): string {
    return `${relationType} relationship from ${sourceTable}.${sourceColumn} to ${targetTable}.${targetColumn}`;
  }
}

/**
 * Creates a new instance of PgAI
 */
export function createPgAI(pool: pg.Pool, config?: PgAIConfig): PgAI {
  return new PgAI(pool, config);
}
