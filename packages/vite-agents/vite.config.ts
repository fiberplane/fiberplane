import path from "node:path";
import { defineConfig } from "vite";
import customEndpointsPlugin from "./src";

export default defineConfig({
  plugins: [customEndpointsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  //  server: {
  //    proxy: {
  //      "agents/": {
  //        target: "ws://localhost:8787",
  //        ws: true,
  //        rewriteWsOrigin: true
  //      }
  //    }
  //  }
});
