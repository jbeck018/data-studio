import type { RequestHandler } from "@react-router/express";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { Server } from "http";
import type { ViteDevServer } from "vite";

async function startServer(): Promise<void> {
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

    // Handle Remix requests
    if (viteDevServer) {
      app.use(viteDevServer.middlewares);
    } else {
      app.use(express.static("public", {
        maxAge: '1h',
      }));
    }

    const build = viteDevServer
      ? async () => {
          const build = await viteDevServer!.ssrLoadModule("virtual:react-router/server-build");
          return build;
        }
      : async () => {
          const build = await import("./build/index.js");
          return build;
        };

    const handler: RequestHandler = createRequestHandler({
      build: build as any,
      mode: process.env.NODE_ENV,
    });

    app.all("*", handler);

    const port = process.env.PORT || 3000;
    await new Promise<void>((resolve) => {
      httpServer.listen(port, () => {
        console.log(`Express server listening on port ${port}`);
        resolve();
      });
    });

    if (process.env.NODE_ENV === "development") {
      await build();
    }

    // Graceful shutdown
    const shutdown = async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await new Promise<void>((resolve) => {
        httpServer.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      });
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void startServer();
