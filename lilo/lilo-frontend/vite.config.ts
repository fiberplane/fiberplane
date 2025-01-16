import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3005,
    proxy: {
      "/api": "http://localhost:6246",
      "/internal": "http://localhost:6246",
      "/auth": "http://localhost:6246",
      "/reference": "http://localhost:6246",
      "/doc": "http://localhost:6246",
    },
  },
});
