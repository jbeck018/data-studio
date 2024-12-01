import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import type { StreamingQueryMessage, StreamingQueryState, StreamingQueryOptions } from '~/types/streaming';
import type { WebSocketMessage } from '~/types/websocket';

const INITIAL_STATE: StreamingQueryState = {
  queryId: '',
  status: 'started',
  rows: [],
  progress: 0,
  fields: [],
};

interface UseStreamingQueryOptions {
  onComplete?: (state: StreamingQueryState) => void;
  onError?: (error: string) => void;
  debug?: boolean;
}

export function useStreamingQuery({ 
  onComplete, 
  onError,
  debug = false 
}: UseStreamingQueryOptions = {}) {
  const [state, setState] = useState<StreamingQueryState>(INITIAL_STATE);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type !== 'query_stream') return;

    const streamMessage = message as StreamingQueryMessage;
    
    setState(prev => {
      const newState = {
        ...prev,
        status: streamMessage.status,
        queryId: streamMessage.queryId,
      };

      if (streamMessage.data) {
        if (streamMessage.data.rows) {
          newState.rows = [...prev.rows, ...streamMessage.data.rows];
        }
        if (streamMessage.data.fields) {
          newState.fields = streamMessage.data.fields;
        }
        if (streamMessage.data.progress !== undefined) {
          newState.progress = streamMessage.data.progress;
        }
        if (streamMessage.data.totalRows !== undefined) {
          newState.totalRows = streamMessage.data.totalRows;
        }
        if (streamMessage.data.error) {
          newState.error = streamMessage.data.error;
          if (onError) onError(streamMessage.data.error);
        }
      }

      if (debug) {
        console.log('Streaming query state update:', newState);
      }

      if (streamMessage.status === 'completed' && onComplete) {
        onComplete(newState);
      }

      return newState;
    });
  }, [debug, onComplete, onError]);

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: handleMessage,
    onError: (error) => {
      setState(prev => ({ ...prev, status: 'error', error: error.message }));
      if (onError) onError(error.message);
    },
    debug,
  });

  const executeQuery = useCallback((sql: string, options?: StreamingQueryOptions) => {
    if (!isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    setState(INITIAL_STATE);
    
    sendMessage({
      type: 'execute_query',
      sql,
      options: {
        batchSize: options?.batchSize || 100,
        maxRows: options?.maxRows || 1000,
        timeout: options?.timeout || 30000,
        includeProgress: options?.includeProgress ?? true,
      },
    });
  }, [isConnected, sendMessage]);

  const cancelQuery = useCallback(() => {
    if (!state.queryId || !isConnected) return;

    sendMessage({
      type: 'cancel_query',
      queryId: state.queryId,
    });
  }, [isConnected, sendMessage, state.queryId]);

  useEffect(() => {
    if (isConnected && !isSubscribed) {
      sendMessage({ type: 'subscribe', channel: 'query_stream' });
      setIsSubscribed(true);
    }
  }, [isConnected, isSubscribed, sendMessage]);

  return {
    status: state.status,
    fields: state.fields || [],
    rows: state.rows,
    progress: state.progress,
    totalRows: state.totalRows,
    error: state.error,
    isConnected,
    executeQuery,
    cancelQuery,
  };
}
