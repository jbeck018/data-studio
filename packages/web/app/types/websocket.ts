import { WebSocket } from 'ws';

export interface WebSocketMessage {
  type: string;
  channel?: string;
  payload?: any;
  message?: string;
}

export interface WebSocketClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'execute_query' | 'cancel_query';
  channel?: string;
  sql?: string;
  queryId?: string;
  options?: {
    batchSize?: number;
    maxRows?: number;
    timeout?: number;
    includeProgress?: boolean;
  };
}

export interface QueryNotification {
  type: 'query_result';
  status: 'running' | 'completed' | 'error';
  queryId: string;
  data?: any;
  error?: string;
  progress?: number;
  startTime?: string;
  endTime?: string;
}

export interface TableUpdateNotification {
  type: 'table_update';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  data: any;
  timestamp: string;
}

export interface SystemNotification {
  type: 'system';
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details?: any;
}

export type NotificationPayload = QueryNotification | TableUpdateNotification | SystemNotification;

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
  channels: Set<string>;
}

export interface WebSocketClientOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  debug?: boolean;
}
