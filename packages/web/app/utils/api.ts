import type { TableDataResponse, TableSchema, QueryResult } from '../types';

export interface Api {
  fetchSchema(): Promise<TableSchema[]>;
  fetchTableData(
    tableName: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<TableDataResponse>;
  executeQuery(sql: string): Promise<QueryResult>;
}