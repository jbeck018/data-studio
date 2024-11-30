export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'notification' | 'error' | 'subscribed' | 'unsubscribed';
  channel?: string;
  payload?: any;
  message?: string;
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

export interface Subscription {
  ws: WebSocket;
  channels: Set<string>;
}

export interface WebSocketClientOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  debug?: boolean;
}
