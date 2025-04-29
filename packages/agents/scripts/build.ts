import fs from "node:fs";
import path from "node:path";
import { build } from "tsup";
import { build as viteBuild } from "vite";
import pkg from "../package.json";
import { execSync } from "node:child_process";

async function run() {
  // Store original directory to return to it later
  const originalDir = process.cwd();

  // Get the current git commit hash
  const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

  console.log("Building agents library...");

  // Build the agents library using tsup
  await build({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    // external: ["vite", "cloudflare:workers", "react", "zod", "agents"],
    external: Object.keys(pkg.dependencies || {}),
    clean: true,
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
  });

  // Define paths for agents-ui
  const agentsPlaygroundPath = path.resolve(
    originalDir,
    "../../packages/agents-ui",
  );
  const targetPlaygroundPath = path.resolve(originalDir, "dist/playground");

  console.log("Building agents-ui...");

  // Change to the agents-ui directory so Vite can resolve all dependencies correctly
  process.chdir(agentsPlaygroundPath);
  await viteBuild({ build: { sourcemap: false } });
  // Change back to original directory
  process.chdir(originalDir);

  // Ensure target directory exists
  if (!fs.existsSync(targetPlaygroundPath)) {
    fs.mkdirSync(targetPlaygroundPath, { recursive: true });
  }

  // Copy all files from the playground dist to our target
  const playgroundDistPath = path.join(agentsPlaygroundPath, "dist");
  const files = fs.readdirSync(playgroundDistPath);

  for (const file of files) {
    const srcPath = path.join(playgroundDistPath, file);
    const destPath = path.join(targetPlaygroundPath, file);

    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  }

  console.log("Build and copy completed successfully!");
}

run().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
