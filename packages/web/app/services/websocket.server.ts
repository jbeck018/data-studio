import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { authenticateWebSocket } from '~/middleware/websocket-auth.server';
import type { AuthenticatedWebSocket, WebSocketMessage } from '~/types/websocket';

interface ExtendedWebSocket extends AuthenticatedWebSocket {
  channels: Set<string>;
  isAlive: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupWebSocketServer();
    this.pingInterval = this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      extWs.channels = new Set();
      extWs.isAlive = true;

      extWs.on('pong', () => {
        extWs.isAlive = true;
      });

      extWs.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleMessage(extWs, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      extWs.on('close', () => {
        extWs.channels.clear();
      });
    });
  }

  private handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage) {
    if (!message.channel) {
      console.warn('Message received without channel:', message);
      return;
    }

    switch (message.type) {
      case 'subscribe':
        ws.channels.add(message.channel);
        break;
      case 'unsubscribe':
        ws.channels.delete(message.channel);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private startHeartbeat(): NodeJS.Timeout {
    return setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const extWs = ws as ExtendedWebSocket;
        if (!extWs.isAlive) {
          return ws.terminate();
        }
        extWs.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  public broadcast(channel: string, data: any) {
    this.wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.channels.has(channel)) {
        ws.send(JSON.stringify({ channel, data }));
      }
    });
  }

  public handleUpgrade(request: IncomingMessage, socket: any, head: Buffer) {
    authenticateWebSocket(this.wss, request)
      .then(() => {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      })
      .catch((error) => {
        console.error('WebSocket authentication failed:', error);
        socket.destroy();
      });
  }

  public close() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}

export const webSocketManager = new WebSocketManager();
