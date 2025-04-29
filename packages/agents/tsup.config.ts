import { execSync } from "node:child_process";
// TODO(laurynas): refactor the build.ts to support watch mode and remove this
// it's just for the dev script
import { defineConfig } from "tsup";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: true,
  external: ["vite", "cloudflare:workers", "react", "zod", "agents"],
  outDir: "dist",
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
});
