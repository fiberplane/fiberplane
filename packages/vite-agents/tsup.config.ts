import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vite/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: true,
  external: ["vite"],
  outDir: "dist",
});
