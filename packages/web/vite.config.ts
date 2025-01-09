import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(), 
    tsconfigPaths()
  ],
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  ssr: {
    noExternal: [
      '@xyflow/react',
      '@xyflow/system',
      'd3-drag',
      'd3-selection',
      'd3-*'  // Add any other d3 packages you're using
    ],
  },
  optimizeDeps: {
    include: ['@xyflow/react', '@xyflow/system'],
  }
  // resolve: {
  //   alias: {
  //     events: 'events',
  //     crypto: 'crypto-browserify',
  //     stream: 'stream-browserify',
  //     buffer: 'buffer',
  //     util: 'util',
  //     path: 'path-browserify'
  //   }
  // },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     target: 'es2020'
  //   },
  //   include: ['buffer', 'events', 'stream-browserify', 'crypto-browserify', 'path-browserify', 'util']
  // },
  // build: {
  //   target: 'es2020',
  //   rollupOptions: {
  //     external: ['fsevents']
  //   }
  // }
});
