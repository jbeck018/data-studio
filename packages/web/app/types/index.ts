export interface QueryColumn {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: QueryColumn[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

export * from './schema';
