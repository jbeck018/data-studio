import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
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
