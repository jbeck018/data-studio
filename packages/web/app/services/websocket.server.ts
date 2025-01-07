import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { authenticateWebSocket } from '../middleware/websocket-auth.server';
import type { 
  AuthenticatedWebSocket, 
  WebSocketMessage, 
  WebSocketClientMessage,
  TableUpdate
} from '../types/websocket';

interface ExtendedWebSocket extends AuthenticatedWebSocket {
  id: string;
  channels: Set<string>;
  isAlive: boolean;
  tables: Set<string>;
}

interface SocketData {
  userId: string;
  organizationId: string;
  subscribedTables: Set<string>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout;
  private socketData: Map<string, SocketData>;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.socketData = new Map();
    this.setupWebSocketServer();
    this.pingInterval = this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      extWs.id = Math.random().toString(36).substr(2, 9);
      extWs.channels = new Set();
      extWs.tables = new Set();
      extWs.isAlive = true;

      this.socketData.set(extWs.id, {
        userId: "",
        organizationId: "",
        subscribedTables: new Set(),
      });

      extWs.on('pong', () => {
        extWs.isAlive = true;
      });

      extWs.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketClientMessage;
          this.handleMessage(extWs, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      extWs.on('close', () => {
        extWs.channels.clear();
        extWs.tables.clear();
        this.socketData.delete(extWs.id);
      });
    });
  }

  private handleMessage(ws: ExtendedWebSocket, message: WebSocketClientMessage) {
    switch (message.type) {
      case 'subscribe':
        if (message.channel) {
          ws.channels.add(message.channel);
        }
        break;
      case 'unsubscribe':
        if (message.channel) {
          ws.channels.delete(message.channel);
        }
        break;
      case 'subscribe:table':
        if (message.tableName) {
          this.subscribeToTable(ws, message.tableName);
        }
        break;
      case 'unsubscribe:table':
        if (message.tableName) {
          this.unsubscribeFromTable(ws, message.tableName);
        }
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private subscribeToTable(ws: ExtendedWebSocket, tableName: string) {
    const data = this.socketData.get(ws.id);
    if (!data) return;

    data.subscribedTables.add(tableName);
    ws.tables.add(tableName);
  }

  private unsubscribeFromTable(ws: ExtendedWebSocket, tableName: string) {
    const data = this.socketData.get(ws.id);
    if (!data) return;

    data.subscribedTables.delete(tableName);
    ws.tables.delete(tableName);
  }

  private startHeartbeat(): NodeJS.Timeout {
    return setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const extWs = ws as ExtendedWebSocket;
        if (extWs.isAlive === false) {
          extWs.terminate();
          return;
        }
        extWs.isAlive = false;
        extWs.ping();
      });
    }, 30000);
  }

  public broadcast(message: WebSocketMessage) {
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  public emitTableUpdate(tableName: string, update: TableUpdate) {
    this.wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.tables.has(tableName)) {
        ws.send(JSON.stringify({
          type: 'table:update',
          update
        }));
      }
    });
  }

  public sendToUser(userId: string, message: WebSocketMessage) {
    this.wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      const socketData = this.socketData.get(extClient.id);
      if (socketData?.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public send(userId: string, message: WebSocketMessage) {
    this.wss.clients.forEach((client) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.userId === userId) {
        client.send(JSON.stringify(message));
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
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      });
  }

  public cleanup() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}

export const webSocketManager = new WebSocketManager();
