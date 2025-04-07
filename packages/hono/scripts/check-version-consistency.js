import fs from "node:fs";
import path from "node:path";

// Define some colors
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function getPackageVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );
  return packageJson.version;
}

function getMiddlewareVersion() {
  const middlewarePath = path.join(process.cwd(), "src/middleware.ts");
  const middlewareContent = fs.readFileSync(middlewarePath, "utf8");

  // Extract version from ASSETS_VERSION constant
  const versionMatch = middlewareContent.match(
    /ASSETS_VERSION\s*=\s*["']([^"']+)["']/,
  );
  if (!versionMatch) {
    throw new Error("Could not find ASSETS_VERSION in middleware.ts");
  }

  return versionMatch[1];
}

function checkVersions() {
  const packageVersion = getPackageVersion();
  const middlewareVersion = getMiddlewareVersion();

  if (packageVersion !== middlewareVersion) {
    console.error(
      `\n${colors.red}${colors.bold}⚠️  Version mismatch detected! ⚠️${colors.reset}\n`,
    );
    console.error(
      `${colors.yellow}package.json version:${colors.reset} ${colors.bold}${packageVersion}${colors.reset}`,
    );
    console.error(
      `${colors.yellow}middleware.ts ASSETS_VERSION:${colors.reset} ${colors.bold}${middlewareVersion}${colors.reset}\n`,
    );
    console.error(`${colors.red}Action Required:${colors.reset}`);
    console.error(`1. Open ${colors.bold}src/middleware.ts${colors.reset}`);
    console.error(
      `2. Locate the ${colors.bold}ASSETS_VERSION${colors.reset} constant`,
    );
    console.error(
      `3. Update it to match package.json: ${colors.bold}export const ASSETS_VERSION = "${packageVersion}"${colors.reset}\n`,
    );
    console.error(
      `${colors.yellow}Note:${colors.reset} This value must be manually updated whenever package.json version changes`,
    );
    console.error(
      "This ensures the CDN URL points to the correct package version.\n",
    );
    console.error(
      "We faced issues with platform interoperability when importing the package.json directly in our code.\n",
    );
    process.exit(1);
  }

  console.log(
    `${colors.green}✓ Version consistency check passed${colors.reset}`,
  );
}

checkVersions();
