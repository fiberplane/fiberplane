import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import Agent from "@fiberplane/agents";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [cloudflare(), react(), tailwindcss(), Agent()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
