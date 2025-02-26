import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(), 
    tsconfigPaths(),
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

  // build: {
  //   target: 'es2020',
  //   rollupOptions: {
  //     external: ['fsevents']
  //   }
  // }
});
