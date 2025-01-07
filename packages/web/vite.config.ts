import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        v3_routeConfig: true,
      },
    }), 
    tsconfigPaths()
  ],
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  resolve: {
    alias: {
      events: 'events',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      path: 'path-browserify'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    include: ['buffer', 'events', 'stream-browserify', 'crypto-browserify', 'path-browserify', 'util']
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      external: ['fsevents']
    }
  }
});
