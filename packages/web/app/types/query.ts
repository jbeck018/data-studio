export interface QueryOptions {
  connectionId: string;
  organizationId: string;
  userId: string;
  timeout?: number;
  maxRows?: number;
}

export interface QueryField {
  name: string;
  dataTypeID: number;
  dataType: string;
}

export interface QueryMetrics {
  executionTimeMs: number;
  startTime: string;
  endTime: string;
  success: boolean;
  rowCount: number;
}

export interface QueryResult {
  rows: Record<string, any>[];
  fields: QueryField[];
  rowCount: number;
  metrics: QueryMetrics;
}

export interface QueryHistoryEntry {
  id: string;
  organizationId: string;
  connectionId: string;
  userId: string;
  query: string;
  status: 'success' | 'error';
  executionTimeMs: string;
  rowCount: string | null;
  error: string | null;
  createdAt: Date;
}

export type QueryStatus = 'idle' | 'running' | 'success' | 'error';

export interface QueryState {
  status: QueryStatus;
  result: QueryResult | null;
  error: string | null;
  isLoading: boolean;
}

export type QueryErrorCode = 
  | 'INVALID_NAME'
  | 'INVALID_TABLE'
  | 'INVALID_COLUMN'
  | 'DANGEROUS_QUERY'
  | 'EXECUTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_ERROR';

export class QueryError extends Error {
  constructor(
    message: string,
    public code: QueryErrorCode,
  ) {
    super(message);
    this.name = 'QueryError';
    Object.setPrototypeOf(this, QueryError.prototype);
  }
}
