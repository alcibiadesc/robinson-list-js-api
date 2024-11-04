import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"), // Ruta de entrada principal
      name: "RobinsonListAPI", // Nombre global en el formato UMD
      fileName: (format) => `robinson-list-api.${format}.js`,
      formats: ["umd", "es"], // Formatos para soportar tanto navegador como ES Modules
    },
    minify: false, // Desactiva la minificación para facilitar la depuración en desarrollo
    rollupOptions: {
      // Excluye dependencias de Node.js que no se necesitan en el navegador
      external: ["crypto-browserify", "node-fetch"],
      output: {
        globals: {
          "crypto-browserify": "crypto", // Alias para usar crypto en el navegador
          "node-fetch": "fetch", // Usa fetch en lugar de node-fetch en el navegador
        },
      },
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"', // Define el entorno como producción
  },
  optimizeDeps: {
    exclude: ["crypto-browserify", "node-fetch"], // Evita la optimización de dependencias específicas para el navegador
  },
});
