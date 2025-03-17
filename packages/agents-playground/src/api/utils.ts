import type { DurableObjectsResult, DurableObjectsSuccess } from "@/types";
import fs from "node:fs";
import path from "node:path";
import toml from "toml";
import { parse } from "jsonc-parser";

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

	configPath = "./wrangler.jsonc";
	if (fs.existsSync(configPath)) {
		const configContent = fs.readFileSync(configPath, "utf-8");
		console.log("found config file: ", configContent);
		return parse(configContent) as WranglerConfig;
	}

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

// Function to find SQLite files in a directory
export async function findSQLiteFiles(dirPath: string): Promise<string[]> {
	// Common SQLite file extensions
	const sqliteExtensions = [
		".sqlite",
		".sqlite3",
		".db",
		".db3",
		".s3db",
		".sl3",
	];

	try {
		// Read all files in the directory
		const files = await fs.promises.readdir(dirPath);

		// Filter files that have SQLite extensions
		const sqliteFiles = files.filter((file) => {
			const ext = path.extname(file).toLowerCase();
			const includes = sqliteExtensions.includes(ext);
			return includes;
		});

		// Return full paths to the SQLite files
		return sqliteFiles.map((file) => path.join(dirPath, file));
	} catch (error) {
		console.error(`Error reading directory ${dirPath}: ${error}`);
		return [];
	}
}

// Function to verify if a file is likely a SQLite database by checking its header
export function isSQLiteFile(filePath: string): boolean {
	try {
		// Read the first 16 bytes of the file
		const header = fs
			.readFileSync(filePath, { flag: "r", encoding: null })
			.slice(0, 16);

		// SQLite files start with the string "SQLite format 3\0"
		const sqliteSignature = Buffer.from("SQLite format 3\0");

		// Compare the header with the SQLite signature
		return (
			Buffer.compare(
				header.slice(0, sqliteSignature.length),
				sqliteSignature,
			) === 0
		);
	} catch (error) {
		return false;
	}
}
