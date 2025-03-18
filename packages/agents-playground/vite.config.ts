import path from "node:path";
// import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { config } from "dotenv";
import { type Plugin, defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";

// Grab configuration from the env vars file
const ENV_FILE = process.env.ENV_FILE ?? "./.dev.vars";
const { embeddedApiUrl } = getDevConfig(ENV_FILE);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    // TanStackRouterVite(),
    svgr({
      svgrOptions: { exportType: "default", ref: true },
      include: "**/*.svg",
    }),
  ],
  optimizeDeps: {
    exclude: ["@iconify/react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 6660,
    proxy: {
      // Proxy requests to the embedded API
      "/fp-agents": {
        target: embeddedApiUrl,
      },
      "/fp-agents/ws": {
        target: "http://localhost:4001",
        ws: true,
      },
      "/agents/": {
        target: embeddedApiUrl,
        ws: true,
      },
    },
    cors: true,
  },
  // NOTE: Consistent filenames (without hashes) make sure we can load the assets via cdn (from @fiberplane/hono)
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
      plugins: [],
    },
  },
});

/**
 * Gets the dev config for the Playground, based on the env var file specified by `ENV_FILE`.
 * This is used to configure the Playground when running locally.
 */
function getDevConfig(envVarsFile: string) {
  config({ path: envVarsFile });

  /**
   * The URL of the agent enabled API you're running. This should both be using the `agents-sdk` as well as
   * the `@fiberplane/agents` package.
   *
   * For example the `examples/simple-agent` package has an agent enabled API running on `http://localhost:5173`.
   */
  const EMBEDDED_API_URL =
    process.env.EMBEDDED_API_URL ?? "http://localhost:5173";

  return {
    /**
     * The URL of the embedded API
     * E.g., `http://localhost:5173`
     */
    embeddedApiUrl: EMBEDDED_API_URL,
  };
}
