import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import express from "express";
import { Server } from "http";
import { initWebSocketServer } from "./app/utils/ws.server";
import type { ViteDevServer } from "vite";

installGlobals();

async function startServer() {
  try {
    let viteDevServer: ViteDevServer | undefined;
    
    if (process.env.NODE_ENV !== "production") {
      const vite = await import("vite");
      viteDevServer = await vite.createServer({
        server: { middlewareMode: true },
      });
    }

    const app = express();
    const httpServer = new Server(app);

    // Initialize WebSocket server
    initWebSocketServer(httpServer);

    // Handle Remix requests
    if (viteDevServer) {
      app.use(viteDevServer.middlewares);
    } else {
      app.use(express.static("public"));
    }

    app.all(
      "*",
      createRequestHandler({
        build: viteDevServer
          ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
          : await import("./build/server/index.js"),
      })
    );

    const port = process.env.PORT || 3000;
    
    httpServer.listen(port, async () => {
      if (process.env.NODE_ENV === "development") {
        const build = await import("@remix-run/dev/server-build");
        broadcastDevReady(build);
      }
      console.log(`Express server listening on port ${port}`);
    });

    // Handle server shutdown
    const signals = ["SIGTERM", "SIGINT"] as const;
    signals.forEach((signal) => {
      process.on(signal, () => {
        console.log(`Received ${signal}, shutting down...`);
        httpServer.close(() => {
          viteDevServer?.close();
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
