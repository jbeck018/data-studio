import type { RequestHandler } from "@react-router/express";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { createServer } from 'node:http';
import type { ViteDevServer } from "vite";
import { webSocketManager } from './app/services/websocket.server';


try {
  let viteDevServer: ViteDevServer | undefined;
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await import("vite");
    viteDevServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }

  const app = express();

  // Handle Remix requests
  if (viteDevServer) {
    app.use(viteDevServer.middlewares);
  } else {
    app.use(express.static("public", {
      maxAge: '1h',
    }));
  }

const build = viteDevServer
  ? () =>
      viteDevServer.ssrLoadModule(
        "virtual:react-router/server-build"
      )
  : await import("./build/server/index.js");

  // Create HTTP server
  // const httpServer = createServer(app);

  // Initialize WebSocket server
  const wsServer = webSocketManager;

  const handler: RequestHandler = createRequestHandler({
    build: build as any,
    mode: process.env.NODE_ENV,
  });

  app.all("*", handler);

  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`Express server listening on port http://localhost:${port}/`);
  });

  // Graceful shutdown
  // const shutdown = async () => {
  //   console.log('SIGTERM signal received: closing HTTP server');
  //   await new Promise<void>((resolve) => {
  //     app.close(() => {
  //       console.log('HTTP server closed');
  //       resolve();
  //     });
  //   });
  //   process.exit(0);
  // };

  // process.on('SIGTERM', shutdown);
  // process.on('SIGINT', shutdown);

} catch (error) {
  console.error('Failed to start server:', error instanceof Error ? error.message : error);
  process.exit(1);
}
