import type { QueryField, QueryMetrics } from './query';

export type StreamingQueryStatus = 
  | 'started'
  | 'streaming'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface StreamingQueryMessage {
  type: 'query_stream';
  queryId: string;
  status: StreamingQueryStatus;
  data?: {
    rows?: Record<string, any>[];
    fields?: QueryField[];
    progress?: number;
    totalRows?: number;
    metrics?: QueryMetrics;
    error?: string;
  };
}

export interface StreamingQueryOptions {
  batchSize?: number;
  maxRows?: number;
  timeout?: number;
  includeProgress?: boolean;
}

export interface StreamingQueryState {
  queryId: string;
  status: StreamingQueryStatus;
  fields: QueryField[];
  rows: Record<string, any>[];
  progress: number;
  totalRows?: number;
  metrics?: QueryMetrics;
  error?: string;
}
