import type { Pool } from 'pg';
import type { TableNode, RelationshipEdge } from '../types/schema';
import type { SchemaInfo } from './pgAI';

export interface CommonQueryPattern {
  text: string;
  template: string;
  description: string;
  complexity: number;
  category: 'select' | 'aggregate' | 'join' | 'update' | 'insert' | 'delete';
  requiredContext: ('table' | 'column' | 'relationship' | 'condition')[];
}

export type ComparisonOperator = 'equals' | 'greater than' | 'less than' | 'between';

export interface ExtractedValues {
  numbers?: number[];
  strings?: string[];
  dates?: string[];
  comparisons?: Array<{
    operator: ComparisonOperator;
    value: string | number;
  }>;
  [key: string]: unknown;
}

export interface TemplateContext {
  tables: TableNode[];
  relationships: RelationshipEdge[];
  userInput: string;
  schemaInfo: SchemaInfo[];
  values?: ExtractedValues;
}

/**
 * Common query patterns for SQL generation
 * These will be used to seed the query_patterns table
 */
export const COMMON_PATTERNS: CommonQueryPattern[] = [
  // Basic SELECT patterns
  {
    text: 'Show all records from {{table}}',
    template: 'SELECT * FROM {{table}}',
    description: 'Retrieves all records from the specified table',
    complexity: 0.1,
    category: 'select',
    requiredContext: ['table'],
  },
  {
    text: 'Find {{table}} where {{column}} equals {{value}}',
    template: 'SELECT * FROM {{table}} WHERE {{column}} = {{value}}',
    description: 'Finds records matching a specific value',
    complexity: 0.2,
    category: 'select',
    requiredContext: ['table', 'column', 'condition'],
  },
  {
    text: 'Get the latest {{count}} records from {{table}} ordered by {{column}}',
    template: 'SELECT * FROM {{table}} ORDER BY {{column}} DESC LIMIT {{count}}',
    description: 'Retrieves the most recent records based on a column',
    complexity: 0.3,
    category: 'select',
    requiredContext: ['table', 'column'],
  },

  // Aggregation patterns
  {
    text: 'Count total records in {{table}}',
    template: 'SELECT COUNT(*) as total FROM {{table}}',
    description: 'Counts the total number of records',
    complexity: 0.2,
    category: 'aggregate',
    requiredContext: ['table'],
  },
  {
    text: 'Calculate average {{column}} in {{table}}',
    template: 'SELECT AVG({{column}}) as average FROM {{table}}',
    description: 'Calculates the average value of a numeric column',
    complexity: 0.3,
    category: 'aggregate',
    requiredContext: ['table', 'column'],
  },
  {
    text: 'Find {{table}} with highest {{column}}',
    template: 'SELECT * FROM {{table}} ORDER BY {{column}} DESC LIMIT 1',
    description: 'Finds the record with the maximum value',
    complexity: 0.3,
    category: 'aggregate',
    requiredContext: ['table', 'column'],
  },

  // JOIN patterns
  {
    text: 'Get {{sourceTable}} with their related {{targetTable}}',
    template: `
      SELECT *
      FROM {{sourceTable}}
      JOIN {{targetTable}} ON {{join:sourceTable:targetTable}}
    `,
    description: 'Retrieves records from two related tables',
    complexity: 0.6,
    category: 'join',
    requiredContext: ['table', 'relationship'],
  },
  {
    text: 'Count {{sourceTable}} grouped by {{targetTable}}',
    template: `
      SELECT {{targetTable}}.{{column}}, COUNT({{sourceTable}}.id) as count
      FROM {{sourceTable}}
      JOIN {{targetTable}} ON {{join:sourceTable:targetTable}}
      GROUP BY {{targetTable}}.{{column}}
    `,
    description: 'Counts records grouped by a related table',
    complexity: 0.7,
    category: 'join',
    requiredContext: ['table', 'relationship', 'column'],
  },
];

/**
 * Advanced SQL template processor that handles complex patterns
 */
export class QueryTemplateProcessor {
  /**
   * Fills in a template with actual values based on context
   */
  static processTemplate(template: string, context: TemplateContext): string {
    let sql = template;

    // Replace table references
    context.tables.forEach(table => {
      const tableRegex = new RegExp(`{{\\s*${table.data.label}\\s*}}`, 'g');
      sql = sql.replace(tableRegex, table.data.label);
      
      // Replace column references for this table
      table.data.columns.forEach(column => {
        const columnRegex = new RegExp(`{{\\s*${table.data.label}\\.${column.name}\\s*}}`, 'g');
        sql = sql.replace(columnRegex, `${table.data.label}.${column.name}`);
      });
    });

    // Replace relationship references
    context.relationships.forEach(rel => {
      const sourceTable = context.tables.find(t => t.id === rel.source);
      const targetTable = context.tables.find(t => t.id === rel.target);
      
      if (sourceTable && targetTable) {
        const joinPattern = `${sourceTable.data.label}.${rel.data.sourceColumn} = ${targetTable.data.label}.${rel.data.targetColumn}`;
        sql = sql.replace(`{{join:${sourceTable.data.label}:${targetTable.data.label}}}`, joinPattern);
      }
    });

    // Replace extracted values
    if (context.values) {
      if (context.values.numbers) {
        context.values.numbers.forEach((num, i) => {
          sql = sql.replace(`{{value${i + 1}}}`, num.toString());
        });
      }
      if (context.values.strings) {
        context.values.strings.forEach((str, i) => {
          sql = sql.replace(`{{string${i + 1}}}`, `'${str}'`);
        });
      }
      if (context.values.dates) {
        context.values.dates.forEach((date, i) => {
          sql = sql.replace(`{{date${i + 1}}}`, `'${date}'`);
        });
      }
      if (context.values.comparisons) {
        context.values.comparisons.forEach((comp, i) => {
          const value = typeof comp.value === 'string' ? `'${comp.value}'` : comp.value;
          sql = sql.replace(`{{comparison${i + 1}}}`, `${comp.operator} ${value}`);
        });
      }
    }

    // Clean up any remaining basic placeholders
    sql = sql.replace(/{{([^}]+)}}/g, (match, placeholder) => {
      // Check schema info for matching column or table names
      const schemaMatch = context.schemaInfo.find(info => 
        info.table_name === placeholder || info.column_name === placeholder
      );
      return schemaMatch ? 
        (schemaMatch.table_name || schemaMatch.column_name) : 
        placeholder;
    });

    return sql.trim();
  }

  /**
   * Analyzes user input to extract potential values
   */
  static extractValuesFromInput(input: string): ExtractedValues {
    const values: ExtractedValues = {};

    // Extract numeric values
    const numbers = input.match(/\b\d+(\.\d+)?\b/g);
    if (numbers) {
      values.numbers = numbers.map(num => parseFloat(num));
    }

    // Extract quoted strings
    const quotes = input.match(/'([^']+)'|"([^"]+)"/g);
    if (quotes) {
      values.strings = quotes.map(quote => quote.slice(1, -1));
    }

    // Extract date-like values
    const dates = input.match(/\d{4}-\d{2}-\d{2}/g);
    if (dates) {
      values.dates = dates;
    }

    // Extract comparison operators and their values
    const comparisons = input.match(/(?:equals?|greater than|less than|between)\s+([^,\s]+)/gi);
    if (comparisons) {
      values.comparisons = comparisons.map(comp => {
        const [operator, value] = comp.split(/\s+(?=\S+$)/);
        const normalizedOperator = operator.toLowerCase() as ComparisonOperator;
        return {
          operator: normalizedOperator,
          value: isNaN(Number(value)) ? value : Number(value),
        };
      });
    }

    return values;
  }
}

function replaceParams(query: string, params: Record<string, any>): string {
  return query.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (key in params) {
      const value = params[key];
      return typeof value === 'string' ? `'${value}'` : String(value);
    }
    return '${' + key + '}';
  });
}

function getRelationshipData(rel: any) {
  if (!rel.data) return null;
  return {
    sourceTable: rel.data.sourceTable,
    targetTable: rel.data.targetTable,
    sourceColumn: rel.data.sourceColumn,
    targetColumn: rel.data.targetColumn,
  };
}

/**
 * Seeds the query_patterns table with common patterns
 */
export async function seedQueryPatterns(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const pattern of COMMON_PATTERNS) {
      await client.query(`
        INSERT INTO query_patterns (
          pattern_text, sql_template, description, metadata
        ) VALUES (
          $1, $2, $3, $4
        )
        ON CONFLICT (pattern_text) DO UPDATE
        SET sql_template = $2,
            description = $3,
            metadata = $4
      `, [
        pattern.text,
        pattern.template,
        pattern.description,
        JSON.stringify({
          category: pattern.category,
          complexity: pattern.complexity,
          requiredContext: pattern.requiredContext,
          similarity: 1.0, // Default similarity for seeded patterns
        }),
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
