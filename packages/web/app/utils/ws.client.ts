import type { PrimaryKey } from "~/types";

type WSMessageType = "getSchema" | "query" | "update" | "delete" | "insert" | "retry";
type WSResponseType = "getSchema_result" | "query_result" | "update_result" | "delete_result" | "insert_result" | "error";

interface WSMessage {
  id: number;
  type: WSMessageType;
  payload: any;
}

interface WSResponse {
  id: number;
  type: WSResponseType;
  data?: any;
  error?: string;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageQueue: { resolve: Function; reject: Function }[] = [];
  private messageId = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.processQueue();
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.ws = null;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onmessage = (event) => {
      const response: WSResponse = JSON.parse(event.data);
      const pendingMessage = this.messageQueue[response.id];
      if (pendingMessage) {
        if (response.error) {
          pendingMessage.reject(new Error(response.error));
        } else {
          pendingMessage.resolve(response.data);
        }
        delete this.messageQueue[response.id];
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  private async sendMessage(type: WSMessageType, payload: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.messageQueue[id] = { resolve, reject };

      const message: WSMessage = {
        id,
        type,
        payload,
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        this.messageQueue[id] = { resolve, reject };
      }
    });
  }

  private processQueue() {
    for (const [id, { resolve, reject }] of Object.entries(this.messageQueue)) {
      const message: WSMessage = {
        id: parseInt(id),
        type: "retry",
        payload: {},
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        reject(new Error("WebSocket is not connected"));
      }
    }
  }

  async getTableSchema(tableName: string): Promise<any> {
    return this.sendMessage("getSchema", { tableName });
  }

  async queryTable(tableName: string): Promise<any> {
    return this.sendMessage("query", { tableName });
  }

  async updateRow(tableName: string, primaryKey: PrimaryKey, data: Record<string, any>): Promise<any> {
    return this.sendMessage("update", { tableName, primaryKey, data });
  }

  async deleteRow(tableName: string, primaryKey: PrimaryKey): Promise<any> {
    return this.sendMessage("delete", { tableName, primaryKey });
  }

  async insertRow(tableName: string, data: Record<string, any>): Promise<any> {
    return this.sendMessage("insert", { tableName, data });
  }
}

let wsClient: WebSocketClient | null = null;

export function getWebSocketClient() {
  if (!wsClient) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    wsClient = new WebSocketClient(wsUrl);
  }
  return wsClient;
}
