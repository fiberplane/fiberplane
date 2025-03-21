import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { agentsPlugin } from "@fiberplane/agents/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [cloudflare(), react(), tailwindcss(), agentsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
