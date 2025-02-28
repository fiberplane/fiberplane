import path from "node:path";
import replace from "@rollup/plugin-replace";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { config } from "dotenv";
import { type Plugin, defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";

// Grab configuration from the env vars file
const ENV_FILE = process.env.ENV_FILE ?? "./.dev.vars";
const {
  embeddedApiUrl,
  internalApiProxyTarget,
  openApiSpecUrl,
  proxyHeaders,
} = getDevConfig(ENV_FILE);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    injectPlaygroundDevConfig(),
    react(),
    TanStackRouterVite(),
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
      // Proxy requests to the workflow aliases
      "/w/": {
        target: internalApiProxyTarget,
        headers: proxyHeaders,
      },
      // Proxy requests to the embedded API
      "/api": {
        target: internalApiProxyTarget,
        headers: proxyHeaders,
      },
      // Proxy requests to the OpenAPI spec, so the embedded api doesn't need to have cors enabled
      [openApiSpecUrl]: {
        target: embeddedApiUrl,
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
      plugins: [
        replace({
          delimiters: ["", ""],
          preventAssignment: true,
          values: {
            // This fixes an issue with the @jsdevtools/ono package in the browser
            // see https://github.com/JS-DevTools/ono/issues/19
            'if (typeof module === "object" && typeof module.exports === "object") {':
              'if (typeof module === "object" && typeof module.exports === "object" && typeof module.exports.default === "object") {',
          },
        }),
      ],
    },
  },
});

/**
 * Injects the playground config into the HTML for dev purposes.
 * This is needed because the embedded API is not available during dev.
 */
function injectPlaygroundDevConfig(): Plugin {
  return {
    name: "inject-playground-config",
    apply: "serve", // only run during dev
    transformIndexHtml(html) {
      const options = {
        mountedPath: "/",
        openapi: {
          url: openApiSpecUrl,
        },
      };

      return html.replace(
        '<div id="root"></div>',
        `<div id="root" data-options='${JSON.stringify(options)}'></div>`,
      );
    },
  };
}

/**
 * Gets the dev config for the Playground, based on the env var file specified by `ENV_FILE`.
 * This is used to configure the Playground when running locally.
 */
function getDevConfig(envVarsFile: string) {
  config({ path: envVarsFile });

  /**
   * The SPA, when running locally, needs to proxy requests to the embedded API sometimes
   * It's nice to be able to configure this.
   *
   * E.g., if you're running a sample API on localhost:6242 instead of localhost:8787,
   * you can set EMBEDDED_API_URL=http://localhost:6242
   * to make the SPA proxy requests to your local API with the @fiberplane/hono package.
   */
  const EMBEDDED_API_URL =
    process.env.EMBEDDED_API_URL ?? "http://localhost:8787";

  /**
   * The path at which `@fiberplane/hono` is mounted on the local API.
   */
  const EMBEDDED_API_MOUNT_PATH = process.env.EMBEDDED_API_MOUNT_PATH ?? "/fp";

  const openApiSpecUrl =
    process.env.EMBEDDED_API_SPEC_URL ?? "/openapi.json";

  const internalApiProxyTarget = `${EMBEDDED_API_URL}${EMBEDDED_API_MOUNT_PATH}`;

  const fiberplaneApiKey = process.env.FIBERPLANE_API_KEY;

  return {
    /**
     * The URL of the embedded API
     * E.g., `http://localhost:8787`
     */
    embeddedApiUrl: EMBEDDED_API_URL,

    /**
     * The URL of the OpenAPI spec file on the local API.
     * This is used to fetch the OpenAPI spec for the Playground.
     * 
     * Can either be a relative path (e.g., `/openapi.json`) or a full URL,
     * but if it's a full URL, the api should have cors enabled.
     */
    openApiSpecUrl,

    /**
     * The target to proxy requests to the embedded API.
     * This is the URL of the local API + the path at which `@fiberplane/hono` is mounted.
     * 
     * If your local api is on `http://localhost:8787` and integrates Fiberplane like this:
     *   ```ts
     *   app.use("/fp/*", createFiberplane({ ... }));
     *   ```
     * Then you should set `EMBEDDED_API_URL=http://localhost:8787` and `EMBEDDED_API_MOUNT_PATH=/fp`
     */
    internalApiProxyTarget,

    /**
     * `proxyHeaders` is only used if `FIBERPLANE_API_KEY` is set in the env vars file.
     *
     * This is setup to work with the fp-services API running locally.
     */
    proxyHeaders: fiberplaneApiKey ? {
      Authorization: `Bearer ${fiberplaneApiKey}`,
    } : undefined,
  };
}