// vite.config.js
import { defineConfig } from "vite";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

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
      output: {
        globals: {
          "node-fetch": "fetch",
        },
      },
    },
  },
  plugins: [
    {
      ...NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      }),
      enforce: "post",
    },
    {
      ...NodeModulesPolyfillPlugin(),
      enforce: "post",
    },
  ],
  resolve: {
    alias: {
      "node:buffer": "buffer",
      "node:stream": "stream-browserify",
      "node:process": "process/browser",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
    },
  },
  optimizeDeps: {
    include: ["crypto-browserify", "buffer", "stream-browserify", "process"],
  },
});
