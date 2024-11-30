import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { Pool } from 'pg';
import { authenticateWebSocket } from '~/middleware/websocket-auth.server';
import type { WebSocketMessage, Subscription } from '~/types/websocket';

export class RealtimeServer {
  private wss: WebSocketServer;
  private subscriptions: Map<WebSocket, Subscription> = new Map();
  private pool: Pool;
  private rateLimits: Map<string, number> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 100;

  constructor(server: Server, connectionString: string) {
    this.wss = new WebSocketServer({ 
      server,
      verifyClient: async ({ req }, done) => {
        try {
          const ws = new WebSocket('ws://localhost');
          const isAuthenticated = await authenticateWebSocket(ws, req);
          done(isAuthenticated);
        } catch (error) {
          console.error('Client verification error:', error);
          done(false, 401, 'Unauthorized');
        }
      }
    });

    this.pool = new Pool({ connectionString });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupPostgresListener();

    // Clean up rate limits every minute
    setInterval(() => {
      this.rateLimits.clear();
    }, 60000);
  }

  private async setupPostgresListener() {
    const client = await this.pool.connect();
    
    client.on('notification', (msg) => {
      const payload = JSON.parse(msg.payload || '{}');
      this.broadcast(msg.channel, payload);
    });

    client.on('error', (err) => {
      console.error('PostgreSQL notification client error:', err);
      this.reconnectPostgres();
    });

    setInterval(() => {
      client.query('SELECT 1');
    }, 30000);
  }

  private checkRateLimit(ws: WebSocket): boolean {
    const clientId = this.getClientId(ws);
    const currentRequests = this.rateLimits.get(clientId) || 0;
    
    if (currentRequests >= this.MAX_REQUESTS_PER_MINUTE) {
      this.sendError(ws, 'Rate limit exceeded. Please try again later.');
      return false;
    }

    this.rateLimits.set(clientId, currentRequests + 1);
    return true;
  }

  private getClientId(ws: WebSocket): string {
    // Use a combination of IP and user ID if available
    const userId = (ws as any).userId;
    const socket = (ws as any)._socket;
    const ip = socket ? socket.remoteAddress : 'unknown';
    return userId ? `${userId}:${ip}` : ip;
  }

  private async reconnectPostgres() {
    try {
      const client = await this.pool.connect();
      
      const activeChannels = new Set<string>();
      this.subscriptions.forEach((sub) => {
        sub.channels.forEach((channel) => activeChannels.add(channel));
      });

      for (const channel of activeChannels) {
        await client.query(`LISTEN ${channel}`);
      }
    } catch (error) {
      console.error('Failed to reconnect to PostgreSQL:', error);
      setTimeout(() => this.reconnectPostgres(), 5000);
    }
  }

  private handleConnection(ws: WebSocket) {
    this.subscriptions.set(ws, { ws, channels: new Set() });

    ws.on('message', async (data: WebSocket.RawData) => {
      if (!this.checkRateLimit(ws)) return;

      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'subscribe':
            if (message.channel) {
              await this.handleSubscribe(ws, message.channel);
            }
            break;
          case 'unsubscribe':
            if (message.channel) {
              await this.handleUnsubscribe(ws, message.channel);
            }
            break;
          default:
            this.sendError(ws, 'Invalid message type');
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnect(ws);
    });
  }

  private async handleSubscribe(ws: WebSocket, channel: string) {
    const subscription = this.subscriptions.get(ws);
    if (!subscription) return;

    try {
      // Validate channel name
      if (!/^[a-zA-Z0-9_-]+$/.test(channel)) {
        throw new Error('Invalid channel name');
      }

      const client = await this.pool.connect();
      await client.query(`LISTEN ${channel}`);
      client.release();

      subscription.channels.add(channel);
      ws.send(JSON.stringify({ 
        type: 'subscribed', 
        channel,
        message: `Successfully subscribed to ${channel}` 
      }));
    } catch (error) {
      console.error(`Error subscribing to channel ${channel}:`, error);
      this.sendError(ws, `Failed to subscribe to ${channel}`);
    }
  }

  private async handleUnsubscribe(ws: WebSocket, channel: string) {
    const subscription = this.subscriptions.get(ws);
    if (!subscription) return;

    try {
      let hasOtherSubscribers = false;
      this.subscriptions.forEach((sub) => {
        if (sub.ws !== ws && sub.channels.has(channel)) {
          hasOtherSubscribers = true;
        }
      });

      if (!hasOtherSubscribers) {
        const client = await this.pool.connect();
        await client.query(`UNLISTEN ${channel}`);
        client.release();
      }

      subscription.channels.delete(channel);
      ws.send(JSON.stringify({ 
        type: 'unsubscribed', 
        channel,
        message: `Successfully unsubscribed from ${channel}` 
      }));
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channel}:`, error);
      this.sendError(ws, `Failed to unsubscribe from ${channel}`);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    const subscription = this.subscriptions.get(ws);
    if (!subscription) return;

    subscription.channels.forEach(async (channel) => {
      try {
        await this.handleUnsubscribe(ws, channel);
      } catch (error) {
        console.error(`Error cleaning up subscription to ${channel}:`, error);
      }
    });

    this.subscriptions.delete(ws);
    this.rateLimits.delete(this.getClientId(ws));
  }

  private broadcast(channel: string, payload: unknown) {
    this.subscriptions.forEach((subscription) => {
      if (subscription.channels.has(channel)) {
        subscription.ws.send(JSON.stringify({
          type: 'notification',
          channel,
          payload
        }));
      }
    });
  }

  private sendError(ws: WebSocket, message: string) {
    ws.send(JSON.stringify({
      type: 'error',
      message
    }));
  }
}
