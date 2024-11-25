import { WebSocketServer, WebSocket } from "ws";
import { pool } from "./pool.server";
import { sqlSanitizer } from "./sql-sanitizer.server";

interface WSMessage {
  type: "query" | "schema" | "update" | "delete" | "insert";
  payload: any;
}

let wss: WebSocketServer;

export function initWebSocketServer(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (message: Buffer) => {
      try {
        const data: WSMessage = JSON.parse(message.toString());
        const client = await pool.connect();

        try {
          switch (data.type) {
            case "query": {
              const { tableName, filters } = data.payload;
              const safeQuery = sqlSanitizer.sanitizeTableQuery(tableName, filters);
              const result = await client.query(safeQuery);
              ws.send(JSON.stringify({ type: "query_result", payload: result.rows }));
              break;
            }

            case "schema": {
              const { tableName } = data.payload;
              const safeQuery = sqlSanitizer.sanitizeSchemaQuery(tableName);
              const result = await client.query(safeQuery);
              ws.send(JSON.stringify({ type: "schema_result", payload: result.rows }));
              break;
            }

            case "update": {
              const { tableName, primaryKey, data: updateData } = data.payload;
              const safeQuery = sqlSanitizer.sanitizeUpdateQuery(
                tableName,
                primaryKey,
                updateData
              );
              const result = await client.query(safeQuery);
              ws.send(JSON.stringify({ type: "update_result", payload: result.rows[0] }));
              break;
            }

            case "delete": {
              const { tableName, primaryKey } = data.payload;
              const safeQuery = sqlSanitizer.sanitizeDeleteQuery(tableName, primaryKey);
              await client.query(safeQuery);
              ws.send(JSON.stringify({ type: "delete_result", success: true }));
              break;
            }

            case "insert": {
              const { tableName, data: insertData } = data.payload;
              const safeQuery = sqlSanitizer.sanitizeInsertQuery(tableName, insertData);
              const result = await client.query(safeQuery);
              ws.send(JSON.stringify({ type: "insert_result", payload: result.rows[0] }));
              break;
            }
          }
        } finally {
          client.release();
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        if (error instanceof Error) {
          ws.send(JSON.stringify({ type: "error", payload: error.message }));
        } else {
          ws.send(JSON.stringify({ type: "error", payload: "An unknown error occurred" }));
        }
      }
    });
  });

  return wss;
}
