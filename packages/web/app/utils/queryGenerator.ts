import type { TableNode, RelationshipEdge } from '../types/schema';
import type { PgAI } from './pgAI';
import { QueryTemplateProcessor, TemplateContext, ExtractedValues } from './queryPatterns';

export interface QueryContext {
  tables: TableNode[];
  relationships: RelationshipEdge[];
  recentQueries?: string[];
  userInput: string;
}

export interface GeneratedQuery {
  sql: string;
  explanation: string;
  confidence: number;
  relatedTables: string[];
  category?: string;
  complexity?: number;
}

export interface QuerySuggestion {
  text: string;
  sql: string;
  confidence: number;
  category?: string;
  complexity?: number;
}

export interface QueryHistory {
  naturalQuery: string;
  sqlQuery: string;
  successful: boolean;
  executionTime?: number;
  timestamp: Date;
}

export interface QueryMetadata {
  category?: string;
  complexity?: number;
  [key: string]: unknown;
}

/**
 * Generates SQL queries from natural language input using pg_ai
 */
export class QueryGenerator {
  private pgAI: PgAI;
  private tables: TableNode[] = [];
  private relationships: RelationshipEdge[] = [];
  private recentHistory: QueryHistory[] = [];
  private readonly historyLimit = 100;

  constructor(pgAI: PgAI) {
    this.pgAI = pgAI;
  }

  /**
   * Updates the schema context used for query generation
   */
  public async updateSchemaContext(tables: TableNode[], relationships: RelationshipEdge[]): Promise<void> {
    this.tables = tables;
    this.relationships = relationships;
    await this.pgAI.updateSchemaEmbeddings(tables, relationships);
  }

  /**
   * Generates SQL query suggestions based on natural language input
   */
  public async generateQuerySuggestions(
    context: QueryContext,
    maxSuggestions = 3
  ): Promise<QuerySuggestion[]> {
    // Find relevant schema information
    const schemaInfo = await this.pgAI.findRelevantSchemaInfo(context.userInput);
    
    // Find similar query patterns
    const queryPatterns = await this.pgAI.findSimilarQueryPatterns(context.userInput);

    // Extract potential values from user input
    const values: ExtractedValues = QueryTemplateProcessor.extractValuesFromInput(context.userInput);

    // Generate suggestions by combining patterns with schema info
    const suggestions = queryPatterns.map(pattern => {
      const templateContext: TemplateContext = {
        tables: context.tables,
        relationships: context.relationships,
        userInput: context.userInput,
        schemaInfo,
        values,
      };

      const sql = QueryTemplateProcessor.processTemplate(pattern.sql_template, templateContext);
      const metadata = this.parseMetadata(pattern.metadata);

      return {
        text: pattern.pattern_text,
        sql,
        confidence: pattern.similarity,
        category: metadata.category,
        complexity: metadata.complexity,
      };
    });

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Generates a complete SQL query with explanation
   */
  public async generateQuery(context: QueryContext): Promise<GeneratedQuery> {
    // Find relevant schema information
    const schemaInfo = await this.pgAI.findRelevantSchemaInfo(context.userInput);
    
    // Find the best matching query pattern
    const [bestPattern] = await this.pgAI.findSimilarQueryPatterns(context.userInput);

    if (!bestPattern) {
      throw new Error('No suitable query pattern found');
    }

    // Extract values from user input
    const values: ExtractedValues = QueryTemplateProcessor.extractValuesFromInput(context.userInput);

    // Generate SQL using the template processor
    const templateContext: TemplateContext = {
      tables: context.tables,
      relationships: context.relationships,
      userInput: context.userInput,
      schemaInfo,
      values,
    };

    const sql = QueryTemplateProcessor.processTemplate(bestPattern.sql_template, templateContext);
    const metadata = this.parseMetadata(bestPattern.metadata);
    const relatedTables = [...new Set(schemaInfo.map(info => info.table_name))];

    return {
      sql,
      explanation: bestPattern.description || 'Generated SQL query based on natural language input',
      confidence: bestPattern.similarity,
      relatedTables,
      category: metadata.category,
      complexity: metadata.complexity,
    };
  }

  /**
   * Records a query execution in history
   */
  public async recordQueryExecution(
    naturalQuery: string,
    sqlQuery: string,
    successful: boolean,
    executionTime?: number
  ): Promise<void> {
    // Record in database
    await this.pgAI.recordQuery(naturalQuery, sqlQuery, successful, executionTime);

    // Update local history
    this.recentHistory.unshift({
      naturalQuery,
      sqlQuery,
      successful,
      executionTime,
      timestamp: new Date(),
    });

    // Maintain history limit
    if (this.recentHistory.length > this.historyLimit) {
      this.recentHistory.pop();
    }
  }

  /**
   * Gets recent successful queries for context
   */
  private getRecentSuccessfulQueries(): QueryHistory[] {
    return this.recentHistory
      .filter(h => h.successful)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  /**
   * Safely parses metadata from a pattern
   */
  private parseMetadata(metadata?: string): QueryMetadata {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata) as QueryMetadata;
    } catch {
      return {};
    }
  }
}

// Export a function to create QueryGenerator instances
export function createQueryGenerator(pgAI: PgAI): QueryGenerator {
  return new QueryGenerator(pgAI);
}
