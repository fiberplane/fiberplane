import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx", "src/vite/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: true,
  external: ["vite", "cloudflare:workers", "react", "zod", "agents"],
  outDir: "dist",
});
