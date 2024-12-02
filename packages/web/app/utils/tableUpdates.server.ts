import { webSocketManager } from "../services/websocket.server";

export function emitTableInsert(tableName: string, data: Record<string, unknown>) {
  webSocketManager.emitTableUpdate(tableName, {
    type: 'INSERT',
    table: tableName,
    data,
  });
}

export function emitTableUpdate(
  tableName: string,
  data: Record<string, unknown>,
  primaryKey: Record<string, unknown>
) {
  webSocketManager.emitTableUpdate(tableName, {
    type: 'UPDATE',
    table: tableName,
    data,
    primaryKey,
  });
}

export function emitTableDelete(
  tableName: string,
  primaryKey: Record<string, unknown>
) {
  webSocketManager.emitTableUpdate(tableName, {
    type: 'DELETE',
    table: tableName,
    data: {},
    primaryKey,
  });
}
