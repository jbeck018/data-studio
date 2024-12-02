import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebSocketMessage, WebSocketClientMessage } from '../types/websocket';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export function useWebSocket({ onMessage, onError, debug = false }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 2000;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      if (debug) console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.current.onclose = () => {
      if (debug) console.log('WebSocket disconnected');
      setIsConnected(false);

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts.current));
      } else {
        onError?.(new Error('Failed to connect to WebSocket server after multiple attempts'));
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(new Error('WebSocket connection error'));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        if (debug) console.log('Received WebSocket message:', message);
        onMessage?.(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [debug, onError, onMessage]);

  const sendMessage = useCallback((message: WebSocketClientMessage) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      ws.current.send(JSON.stringify(message));
      if (debug) console.log('Sent WebSocket message:', message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      onError?.(new Error('Failed to send WebSocket message'));
    }
  }, [debug, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    socket: ws.current,
  };
}
