// TODO(laurynas): refactor the build.ts to support watch mode and remove this
// it's just for the dev script
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: true,
  external: ["vite", "cloudflare:workers", "react", "zod", "agents"],
  outDir: "dist",
});
