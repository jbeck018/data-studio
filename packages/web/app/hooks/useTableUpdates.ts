import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import type { TableUpdate, TableUpdateMessage, WebSocketMessage } from "../types/websocket";

interface TableDataResponse {
  data: Record<string, unknown>[];
  totalRows: number;
  page?: number;
  pageSize?: number;
}

export function useTableUpdates(tableName: string, initialData: TableDataResponse): TableDataResponse {
  const [data, setData] = useState<TableDataResponse>(initialData);
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'table:update') {
      const update = (message as TableUpdateMessage).update;
      if (update.table !== tableName) return;

      setData(prevData => {
        const newData = { ...prevData };

        switch (update.type) {
          case 'INSERT':
            newData.data = [update.data, ...newData.data];
            newData.totalRows = (newData.totalRows || 0) + 1;
            break;

          case 'UPDATE':
            if (update.primaryKey) {
              newData.data = newData.data.map(row => {
                // Check if this is the row to update by comparing primary key values
                const isMatch = Object.entries(update.primaryKey!).every(
                  ([key, value]) => row[key] === value
                );
                return isMatch ? { ...row, ...update.data } : row;
              });
            }
            break;

          case 'DELETE':
            if (update.primaryKey) {
              newData.data = newData.data.filter(row => {
                // Remove row if primary key matches
                return !Object.entries(update.primaryKey!).every(
                  ([key, value]) => row[key] === value
                );
              });
              newData.totalRows = Math.max(0, (newData.totalRows || 0) - 1);
            }
            break;
        }

        return newData;
      });
    }
  }, [tableName]);

  const { socket, isConnected: connected } = useWebSocket({
    onMessage: handleMessage,
    debug: false
  });

  useEffect(() => {
    if (!socket || !connected) return;

    // Subscribe to table updates
    socket.send(JSON.stringify({
      type: 'subscribe:table',
      tableName
    }));

    return () => {
      socket.send(JSON.stringify({
        type: 'unsubscribe:table',
        tableName
      }));
    };
  }, [socket, connected, tableName]);

  return data;
}
