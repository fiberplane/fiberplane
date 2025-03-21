import fs from "node:fs";
import { parse } from "jsonc-parser";
import toml from "toml";
import type { DurableObjectsResult, DurableObjectsSuccess } from "./types";

/**
 * TypeScript interface for wrangler.toml configuration
 */
interface DurableObjectBinding {
  name: string;
  class_name: string;
  script_name?: string;
}

interface Migration {
  tag?: string;
  new_classes?: string[];
  [key: string]: unknown;
}

export interface WranglerConfig {
  name?: string;
  main?: string;
  compatibility_date?: string;
  durable_objects?: {
    bindings?: DurableObjectBinding[];
  };
  migrations?: Migration[];
  [key: string]: unknown; // For other configuration options
}

export function readConfigFile(): WranglerConfig {
  let configPath = "./wrangler.toml";
  // Check if file exists
  if (fs.existsSync(configPath)) {
    // Read and parse the TOML file
    const configContent = fs.readFileSync(configPath, "utf-8");
    return toml.parse(configContent) as WranglerConfig;
  }
  console.warn("Config file not found: ", configPath);

  configPath = "./wrangler.jsonc";
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf-8");
    return parse(configContent) as WranglerConfig;
  }

  console.warn("Config file not found: ", configPath);

  return { success: false, error: "Config file not found" };
}

/**
 * Extracts Durable Object definitions from wrangler.toml
 * @param {string} configPath - Path to the wrangler.toml file
 * @returns {DurableObjectsResult} Object containing Durable Objects information
 */
export function getDurableObjectsFromConfig(): DurableObjectsResult {
  try {
    const config = readConfigFile();
    const result: DurableObjectsSuccess = {
      success: true,
      durableObjects: {
        bindings: [],
        migrations: [],
        instances: [],
      },
    };

    // Extract bindings
    if (config.durable_objects?.bindings) {
      result.durableObjects.bindings = config.durable_objects.bindings.map(
        (binding) => ({
          name: binding.name,
          className: binding.class_name,
          scriptName: binding.script_name || null,
        }),
      );
    }

    // Extract migrations (if defined)
    if (config.migrations && Array.isArray(config.migrations)) {
      result.durableObjects.migrations = config.migrations
        .filter((migration) => migration.tag === "v1" || migration.new_classes)
        .map((migration) => {
          if (migration.tag === "v1") {
            return {
              tag: "v1",
              newClasses: migration.new_classes || [],
            };
          }
          return {
            newClasses: migration.new_classes || [],
          };
        });
    }

    return result;
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      console.error("Error parsing wrangler.toml:", error.message);
      message = error.message;
    }

    return {
      success: false,
      error: message,
    };
  }
}
