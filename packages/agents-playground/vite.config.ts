import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import customEndpointsPlugin from "./src/plugin";

export default defineConfig({
	plugins: [cloudflare(), react(), tailwindcss(), customEndpointsPlugin()],
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
