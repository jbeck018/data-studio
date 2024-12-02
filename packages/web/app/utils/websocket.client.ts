import type { WebSocketMessage, WebSocketClientOptions } from '../types/websocket';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: WebSocketMessage[] = [];
  private subscriptions = new Set<string>();
  private isConnecting = false;
  private options: Required<WebSocketClientOptions>;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private static instance: WebSocketClient | null = null;

  private constructor(options: WebSocketClientOptions = {}) {
    this.options = {
      reconnectInterval: options.reconnectInterval || 1000,
      maxReconnectAttempts: options.maxReconnectAttempts || 5,
      pingInterval: options.pingInterval || 30000,
      debug: options.debug || false,
    };
  }

  public static getInstance(options?: WebSocketClientOptions): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(options);
    }
    return WebSocketClient.instance;
  }

  public connect(url: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('WebSocket is already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      this.log('WebSocket connection is in progress');
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.processMessageQueue();
          this.resubscribeToChannels();
          resolve();
        };

        this.ws.onclose = (event) => {
          this.log(`WebSocket closed: ${event.code} ${event.reason}`);
          this.isConnecting = false;
          this.clearPingInterval();
          
          if (event.code === 1008) {
            // Authentication error - don't retry
            this.log('Authentication failed. Please log in again.');
            window.location.href = '/login';
            return;
          }

          if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            this.log('Max reconnection attempts reached');
            reject(new Error('Max reconnection attempts reached'));
          }
        };

        this.ws.onerror = (error: Event) => {
          this.log('WebSocket error:', error);
          this.isConnecting = false;
        };

        this.ws.onmessage = this.handleMessage.bind(this);
      } catch (error) {
        this.isConnecting = false;
        this.log('WebSocket connection error:', error);
        reject(error);
      }
    });
  }

  private startPingInterval(): void {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.options.pingInterval);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.ws!.url).catch(() => {
        this.log('Reconnection failed');
      });
    }, delay);
  }

  private resubscribeToChannels(): void {
    this.subscriptions.forEach((channel) => {
      this.send({
        type: 'subscribe',
        channel,
      });
    });
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  public subscribe(channel: string): void {
    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      channel,
    });
  }

  public unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      channel,
    });
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.clearPingInterval();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.messageQueue = [];
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    WebSocketClient.instance = null;
  }

  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
      if (this.ws?.readyState !== WebSocket.CONNECTING) {
        this.connect(this.ws?.url || '').catch(() => {
          this.log('Failed to reconnect while sending message');
        });
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'error':
          this.log('Received error:', message.message);
          if (message.message?.includes('authentication')) {
            window.location.href = '/login';
          }
          break;
        case 'subscribed':
        case 'unsubscribed':
          this.log(`${message.type} to channel ${message.channel}`);
          break;
        case 'notification':
          // Handle different notification types
          if (message.payload) {
            this.handleNotification(message.payload);
          }
          break;
      }

      // Dispatch custom event for external handlers
      window.dispatchEvent(
        new CustomEvent('websocket-message', {
          detail: message,
        })
      );
    } catch (error) {
      this.log('Error handling message:', error);
    }
  }

  private handleNotification(payload: unknown): void {
    // Handle different notification types
    if (typeof payload === 'object' && payload !== null) {
      const { type } = payload as { type?: string };
      switch (type) {
        case 'query_result':
          this.log('Received query result:', payload);
          break;
        case 'table_update':
          this.log('Received table update:', payload);
          break;
        case 'system':
          this.log('Received system notification:', payload);
          break;
      }
    }
  }

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}
