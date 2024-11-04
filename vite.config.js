import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"), // Cambia a la ruta de tu archivo principal
      name: "RobinsonListAPI", // Nombre de la biblioteca
      fileName: (format) => `robinson-list-api.${format}.js`,
      formats: ["umd", "es"], // UMD y ES para compatibilidad
    },
    rollupOptions: {
      // Excluir dependencias que no quieras incluir en el bundle
      external: ["crypto-browserify", "node-fetch"],
      output: {
        globals: {
          "crypto-browserify": "crypto", // Nombre global para usar crypto-browserify en el navegador
          "node-fetch": "fetch",
        },
      },
    },
  },
});
