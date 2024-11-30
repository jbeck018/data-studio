import { useEffect, useCallback, useRef } from 'react';
import { WebSocketClient } from '~/utils/websocket.client';
import type { WebSocketMessage } from '~/types/websocket';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  debug?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const clientRef = useRef<WebSocketClient>();
  const messageHandlerRef = useRef(options.onMessage);

  // Update message handler ref when the callback changes
  useEffect(() => {
    messageHandlerRef.current = options.onMessage;
  }, [options.onMessage]);

  // Initialize WebSocket client
  useEffect(() => {
    const client = WebSocketClient.getInstance({
      debug: options.debug,
      reconnectInterval: options.reconnectInterval,
      maxReconnectAttempts: options.maxReconnectAttempts,
    });

    clientRef.current = client;

    const handleMessage = (event: CustomEvent<WebSocketMessage>) => {
      messageHandlerRef.current?.(event.detail);
    };

    // Add event listener for WebSocket messages
    window.addEventListener('websocket-message', handleMessage as EventListener);

    // Connect to WebSocket server
    client.connect(url).catch((error) => {
      console.error('Failed to connect to WebSocket server:', error);
    });

    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
      client.close();
    };
  }, [url, options.debug, options.reconnectInterval, options.maxReconnectAttempts]);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    clientRef.current?.subscribe(channel);
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    clientRef.current?.unsubscribe(channel);
  }, []);

  // Send a message
  const send = useCallback((message: WebSocketMessage) => {
    if (!clientRef.current) {
      console.error('WebSocket client not initialized');
      return;
    }
    clientRef.current.send(message);
  }, []);

  return {
    subscribe,
    unsubscribe,
    send,
  };
}
