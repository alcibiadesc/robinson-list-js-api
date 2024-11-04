// vite.config.js
import { defineConfig } from "vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "RobinsonListAPI",
      fileName: (format) => `robinson-list-api.${format}.js`,
      formats: ["umd", "es"],
    },
    minify: false,
    rollupOptions: {
      external: ["node-fetch"],
    },
  },
  plugins: [
    nodePolyfills({
      crypto: true,
      buffer: true,
      stream: true,
    }),
  ],
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["crypto-browserify", "buffer", "stream-browserify"],
  },
});
