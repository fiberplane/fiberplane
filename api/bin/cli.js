#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

import logger from "./logger.js";
import {
  askUser,
  cliAnswerToBool,
  findInParentDirs,
  isPortTaken,
  safeParseJSONFile,
  safeParseTomlFile,
} from "./utils.js";

// Shim __filename and __dirname since we're using esm
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
// Handle emptystring script (I don't think this happens in practice but let's be defensive)
const script = (args[0] ?? "").trim();

// HACK - If no script is specified, migrate the db then start running studio
//        This is a quick way to get started!
const scriptsToRun = !script ? ["migrate", "studio"] : [script];

const validScripts = {
  migrate: "dist/migrate.js",
  studio: "dist/src/index.node.js",
};

// Where we keep config files
const CONFIG_DIR_NAME = ".fpxconfig";
const CONFIG_FILE_NAME = "fpx.v0.config.json";

// Paths to relevant project directories and files
const WRANGLER_TOML_PATH = findInParentDirs("wrangler.toml");
const PACKAGE_JSON_PATH = findInParentDirs("package.json");
const PROJECT_ROOT_DIR = findProjectRoot();

// Loading some possible configuration from the environment
const WRANGLER_TOML = safeParseTomlFile(WRANGLER_TOML_PATH);
const PACKAGE_JSON = safeParseJSONFile(PACKAGE_JSON_PATH);
const PROJECT_PORT = readWranglerPort();
const { initialized: IS_INITIALIZING_FPX, config: USER_V0_CONFIG } =
  readUserConfig();

const USER_VARS = {};

loadUserConfigIntoUserVars();

runWizard();

/**
 * Run the wizard to get the user's configuration for FPX
 * If there are valid values in .fpxconfig, we skip asking questions
 */
async function runWizard() {
  if (IS_INITIALIZING_FPX) {
    logger.info(chalk.dim("\nInitializing FPX...\n"));
  } else {
    logger.info(chalk.dim(`\nLoading FPX config from ${CONFIG_DIR_NAME}...`));
  }

  const FPX_PORT = await getFpxPort();

  await updateEnvFileWithFpxEndpoint(FPX_PORT);

  const FPX_SERVICE_TARGET = await getServiceTarget();

  await pingTargetAndConfirm(FPX_SERVICE_TARGET);

  const FPX_DATABASE_URL = getFpxDatabaseUrl();

  // Refresh the config with any new values
  USER_VARS.FPX_PORT = FPX_PORT;
  USER_VARS.FPX_SERVICE_TARGET = FPX_SERVICE_TARGET;
  USER_VARS.FPX_DATABASE_URL = FPX_DATABASE_URL;

  const SERVICE_NAME = getFallbackServiceName();
  if (!USER_VARS.FPX_SERVICE_NAME && SERVICE_NAME) {
    USER_VARS.FPX_SERVICE_NAME = SERVICE_NAME;
  }

  // Save the user's configuration to the .fpxconfig directory
  saveUserConfig(USER_VARS);

  scriptsToRun.forEach(runScript);
}

/**
 * Get the port for FPX Studio to run on
 */
async function getFpxPort() {
  // This looks confusing but the basic pattern is:
  // - If we're initializing use the fallback value, which is dynamic depending on env.
  // - If we're not initializing, try to determine based on the local config
  //  - If there was a preconfigured port, but it's taken, ask the user to choose a new port
  //
  const hasConfiguredFpxPort = getFallbackFpxPort() !== null;
  const fpxPortFallback = getFallbackFpxPort() || 8788;
  let FPX_PORT = fpxPortFallback;

  // If the user's selected port for running FPX is taken, try to find a new fallback
  // If the user specified a port to run on already, ask them to choose a new port
  while (await isPortTaken(FPX_PORT)) {
    const portAlreadyInUse = chalk.yellow(
      `Port ${FPX_PORT} is already in use.`,
    );
    logger.debug(`${portAlreadyInUse}, looking for another one...`);

    // Find a new fallback port
    let nextFallback = (Number.parseInt(FPX_PORT, 10) + 1).toString();

    // Make sure the fallback doesn't conflict with the service target
    const serviceTarget = getFallbackServiceTarget()?.toString();
    const hasConflict =
      nextFallback === serviceTarget ||
      serviceTarget?.endsWith(`:${nextFallback}`);
    if (hasConflict) {
      nextFallback = (Number.parseInt(nextFallback, 10) + 1).toString();
    }

    // HACK - If the nextFallback exceeds 65535, we're out of port range.
    //        So, we'll just default to 8787.
    if (hasConfiguredFpxPort || nextFallback > 65535) {
      FPX_PORT = await askUser(
        `  ⚠️ ${portAlreadyInUse}\n  Please choose a different port for FPX.`,
        nextFallback > 65535 ? "8787" : nextFallback,
      );
      if (nextFallback > 65535) {
        break;
      }
    } else {
      FPX_PORT = nextFallback;
    }
  }

  return FPX_PORT;
}

/**
 * Update the project's env file with the FPX_ENDPOINT variable,
 * if we can determine the env file to update.
 */
async function updateEnvFileWithFpxEndpoint(fpxPort) {
  const expectedFpxEndpoint = `http://localhost:${fpxPort}/v0/logs`;

  if (shouldCreateDevVarsFile()) {
    touchDevVarsFile();
  }

  const envFilePath = findEnvVarFile();
  const envFileName = envFilePath && path.basename(envFilePath);
  const fpxEndpoint = envFilePath && getFpxEndpointFromEnvFile(envFilePath);
  const isDifferent = fpxEndpoint !== expectedFpxEndpoint;

  // Ask the user if we should update the env file
  // - if an env file exists and the fpx endpoint is missing
  // - if an env file exists and the fpx endpoint is different
  const shouldAsk = envFilePath && (!fpxEndpoint || isDifferent);

  if (!shouldAsk) {
    return;
  }

  const envVarLine = `FPX_ENDPOINT=${expectedFpxEndpoint}`;
  const lede = !fpxEndpoint
    ? `  ⚠️ ${envFileName} needs to point to a local FPX Studio to work properly`
    : `  ⚠️ ${envFileName} points to a different FPX Studio endpoint`;
  const operation = !fpxEndpoint
    ? `  Add FPX Studio endpoint to ${envFileName}?`
    : `  Update FPX Studio endpoint in ${envFileName}?`;
  const question = [chalk.yellow(lede), operation].filter(Boolean).join("\n");
  const updateEnvVarAnswer = await askUser(question, "y");
  const shouldUpdateEnvVar = cliAnswerToBool(updateEnvVarAnswer);

  if (!shouldUpdateEnvVar) {
    return;
  }

  if (fpxEndpoint !== null) {
    logger.debug(
      `Replacing ${fpxEndpoint} with ${envVarLine} in ${envFilePath}`,
    );
    replaceEnvVarLine(envFilePath, envVarLine);
  } else {
    fs.appendFileSync(envFilePath, `\n${envVarLine}\n`);
  }
  logger.info(
    chalk.dim(`  ℹ️ Updated ${envFileName}. Remember to restart your api!`),
  );
}

/**
 * Get the service target for FPX (the service we should monitor)
 * This is necessary for auto detecting the routes of the app
 */
async function getServiceTarget() {
  const fpxTargetQuestion = "  Which port is your api running on?";
  const fpxTargetFallback = getFallbackServiceTarget() || 8787;
  const hasConfiguredTarget = getFallbackServiceTarget() !== null;

  // This looks confusing but the basic pattern is:
  // - If we're initializing, ask the user where we should run.
  //   The default (fallback) value is dynamic depending on env.
  // - If we're not initializing, try to skip the question based on local config, fall back to asking them.
  //
  let FPX_SERVICE_TARGET;
  if (IS_INITIALIZING_FPX) {
    FPX_SERVICE_TARGET = await askUser(fpxTargetQuestion, fpxTargetFallback);
  } else if (hasConfiguredTarget) {
    FPX_SERVICE_TARGET = getFallbackServiceTarget();
  } else {
    FPX_SERVICE_TARGET = await askUser(fpxTargetQuestion, fpxTargetFallback);
  }

  return FPX_SERVICE_TARGET;
}

/**
 * Checks if there is a service running on the target port
 * If not, asks the user to confirm whether to continue
 */
async function pingTargetAndConfirm(port) {
  const isServiceUp = await isPortTaken(port);
  if (!isServiceUp) {
    await askUser(
      `  ⚠️ Could not find your api on port ${port}. Remember to start it!\n  ${chalk.dim("(Press enter to continue.)")}`,
    );
  }
}

/**
 * Run the specified script (assumed to be in ../scripts)
 */
function runScript(scriptName) {
  const scriptPath = validScripts[scriptName];
  if (!scriptPath) {
    logger.error(
      `Invalid script "${scriptName}". Valid scripts are: ${Object.keys(validScripts).join(", ")}`,
    );
    process.exit(1);
  }

  // Get the root directory of this script's project
  const scriptDir = path.resolve(__dirname, "../");

  // Construct the command to run the appropriate script in the `dist` folder
  const command = `node ${path.join(scriptDir, scriptPath)}`;

  execSync(command, {
    stdio: "inherit",
    env: { ...USER_VARS, ...process.env },
  });
}

/**
 * Looks for the project root by looking first for a `wrangler.toml` file, then a `package.json` file
 * Searches all parent directories up to the root of the filesystem
 */
function findProjectRoot() {
  const projectRoot = WRANGLER_TOML_PATH || PACKAGE_JSON_PATH;
  if (!projectRoot) {
    return null;
  }
  return path.dirname(projectRoot);
}

/**
 * Read the service port from wrangler.toml, if it exists
 */
function readWranglerPort() {
  return WRANGLER_TOML?.dev?.port || null;
}

/**
 * Check if the project has a wrangler.toml file in the current working directory
 */
function hasWranglerToml() {
  return WRANGLER_TOML_PATH !== null;
}

/**
 * Reads the user's configuration from the `.fpxconfig` directory
 *
 * Returns an object with the following properties:
 * - initialized: boolean - whether the config file was just initialized
 * - config: object - the configuration object
 */
function readUserConfig() {
  let initialized = false;
  const configDir = path.join(PROJECT_ROOT_DIR, CONFIG_DIR_NAME);
  const configPath = path.join(configDir, CONFIG_FILE_NAME);
  const gitignorePath = path.join(configDir, ".gitignore");
  const gitignoreEntry =
    "\n# fpx local database\nfpx.db\n# fpx local env vars\nfpx.v0.config.json\n";

  // Create the .fpxconfig directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    initialized = true;
    fs.mkdirSync(configDir);
  }

  // Create the fpx configuration file if it doesn't exist
  if (!fs.existsSync(configPath)) {
    initialized = true;
    fs.writeFileSync(configPath, JSON.stringify({}));
  }

  // Create a .gitignore in the config dir
  // Add the fpx.db file to the .gitignore file if it doesn't exist
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreEntry);
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  if (!gitignoreContent.includes("fpx.db")) {
    fs.appendFileSync(gitignorePath, gitignoreEntry);
  }

  let config = safeParseJSONFile(configPath);
  if (!config) {
    initialized = true;
    config = {};
  }

  return {
    initialized,
    config,
  };
}

/**
 * Load the user's configuration into the USER_VARS object
 *
 * Hacky way to have some control over the configuration and env vars
 * that we ultimately inject when we run the api.
 */
function loadUserConfigIntoUserVars() {
  if (USER_V0_CONFIG?.FPX_PORT) {
    USER_VARS.FPX_PORT = USER_V0_CONFIG.FPX_PORT;
  }
  if (USER_V0_CONFIG?.FPX_SERVICE_TARGET) {
    USER_VARS.FPX_SERVICE_TARGET = USER_V0_CONFIG.FPX_SERVICE_TARGET;
  }
  if (USER_V0_CONFIG?.FPX_SERVICE_NAME) {
    USER_VARS.FPX_SERVICE_NAME = USER_V0_CONFIG.FPX_SERVICE_NAME;
  }
  if (USER_V0_CONFIG?.FPX_DATABASE_URL) {
    USER_VARS.FPX_DATABASE_URL = USER_V0_CONFIG.FPX_DATABASE_URL;
  }
}

/**
 * Saves the user's configuration to the `.fpxconfig` directory
 */
function saveUserConfig(config) {
  const configDir = path.join(PROJECT_ROOT_DIR, CONFIG_DIR_NAME);
  const configPath = path.join(configDir, CONFIG_FILE_NAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get the fallback port for FPX to run on
 *
 * This is either from the environment or the user's config
 */
function getFallbackFpxPort() {
  return process.env.FPX_PORT || USER_VARS.FPX_PORT || null;
}

/**
 * Get the fallback service name for FPX
 *
 * This is either from the environment, the user's config, the wrangler.toml file, or the package.json file
 */
function getFallbackServiceName() {
  return (
    process.env.FPX_SERVICE_NAME ||
    USER_VARS.FPX_SERVICE_NAME ||
    WRANGLER_TOML?.name ||
    PACKAGE_JSON?.name ||
    null
  );
}

/**
 * Get the fallback service target for FPX
 *
 * This is either from the environment, the user's config, or the wrangler.toml file
 */
function getFallbackServiceTarget() {
  return (
    process.env.FPX_SERVICE_TARGET ||
    USER_VARS.FPX_SERVICE_TARGET ||
    PROJECT_PORT ||
    null
  );
}

/**
 * Find the environment variable file with the given precedence
 */
function findEnvVarFile() {
  const envFiles = [".dev.vars", ".env.local", ".env.dev", ".env"];
  for (const file of envFiles) {
    const filePath = path.join(PROJECT_ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

/**
 * Create an empty .dev.vars file in the project root
 */
function touchDevVarsFile() {
  try {
    fs.writeFileSync(path.join(PROJECT_ROOT_DIR, ".dev.vars"), "");
    logger.info(chalk.dim("  ℹ️ Created an empty .dev.vars file"));
  } catch {
    logger.debug(chalk.red("  ❤️‍🩹 Failed to create .dev.vars file"));
  }
}

/**
 * Check if we should create the .dev.vars file
 *
 * This is true if the user has a wrangler.toml file in the project root
 * and the .dev.vars file does not exist there
 */
function shouldCreateDevVarsFile() {
  if (!hasWranglerToml()) {
    return false;
  }
  const devVarsFilePath = path.join(PROJECT_ROOT_DIR, ".dev.vars");
  try {
    return !fs.existsSync(devVarsFilePath);
  } catch {
    return false;
  }
}

/**
 * Read the environment variable file and check for FPX_ENDPOINT
 */
function getFpxEndpointFromEnvFile(envFilePath) {
  try {
    const envContent = fs.readFileSync(envFilePath, "utf8");
    // NOTE - This regex uses multiline mode
    const match = envContent.match(/^FPX_ENDPOINT=(.*)$/m);
    return match ? match[1] : null;
  } catch (_error) {
    // Silent error because we do not want errors to stop the cli from running
    return null;
  }
}

/**
 * Replace the line in the env file with the new value
 */
function replaceEnvVarLine(envFilePath, envVarLine) {
  const envContent = fs.readFileSync(envFilePath, "utf8");
  // NOTE - This regex uses multiline mode
  const updatedContent = envContent.replace(/^FPX_ENDPOINT=.*$/m, envVarLine);
  fs.writeFileSync(envFilePath, updatedContent);
}

/**
 * Get the path to the FPX database
 *
 * This is in the `.fpxconfig` directory, which allows us to gitignore it more cleanly
 */
function getFpxDatabaseUrl() {
  const configDir = path.join(PROJECT_ROOT_DIR, CONFIG_DIR_NAME);
  const dbPath = path.join(configDir, "fpx.db");
  return `file:${dbPath}`;
}
