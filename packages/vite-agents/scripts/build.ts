import { build as viteBuild } from "vite";
import { build } from "tsup";
import fs from "node:fs";
import path from "node:path";

async function run() {
  // Store original directory to return to it later
  const originalDir = process.cwd();

  console.log("Building vite-agents library...");

  // Build the vite-agents library using tsup
  await build({
    entry: ["src/index.tsx"],
    format: ["esm"],
    dts: true,
    external: ["vite", "cloudflare:workers", "react", "zod", "agents"],
    clean: true,
  });

  // Define paths for agents-playground
  const agentsPlaygroundPath = path.resolve(
    originalDir,
    "../../packages/agents-playground",
  );
  const targetPlaygroundPath = path.resolve(originalDir, "dist/playground");

  console.log("Building agents-playground...");

  // Change to the agents-playground directory so Vite can resolve all dependencies correctly
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
