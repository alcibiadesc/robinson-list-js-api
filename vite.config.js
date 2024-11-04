import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "RobinsonListAPI",
      fileName: (format) => `robinson-list-api.${format}.js`,
      formats: ["umd", "es"],
    },
    rollupOptions: {
      external: ["crypto-browserify", "node-fetch"],
      output: {
        globals: {
          "crypto-browserify": "crypto",
          "node-fetch": "fetch",
        },
      },
    },
  },
});
