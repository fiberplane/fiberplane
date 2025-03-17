import sqlite3 from "sqlite3";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import toml from "toml";
import { parse } from "jsonc-parser";
import type { DurableObjectsResult, DurableObjectsSuccess } from "./types";

// Define types for the result structure
export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

// Map SQLite column types to TypeScript types
type TypeMapping<T extends ColumnType[]> = T extends ["string"]
  ? string
  : T extends ["number"]
    ? number
    : T extends ["boolean"]
      ? boolean
      : T extends ["null"]
        ? null
        : T extends ["object"]
          ? Record<string, unknown>
          : T extends ["array"]
            ? unknown[]
            : T extends Array<infer U>
              ? U extends ColumnType
                ? unknown
                : never
              : unknown;

// Generic table type that ensures data matches column structure
export type Table<
  C extends Record<string, ColumnType[]> = Record<string, ColumnType[]>,
> = {
  columns: C;
  data: Array<{
    [K in keyof C]: TypeMapping<C[K]>;
  }>;
};

// Database result type
export type DatabaseResult = Record<string, Table>;

// Helper function to determine the type of a value
function getValueType(value: unknown): ColumnType {
  if (value === null) {
    return "null";
  }

  const type = typeof value;
  if (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "object"
  ) {
    if (Array.isArray(value)) {
      return "array";
    }

    return type as ColumnType;
  }

  return "string"; // Default fallback
}

// Function to serialize a SQLite database to a structured JavaScript object
export async function serializeSQLiteToJSON(
  dbPath: string,
  // outputPath?: string,
): Promise<DatabaseResult> {
  return new Promise((resolve, reject) => {
    // Open the database
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(`Error opening database: ${err.message}`);
        return;
      }
      // console.log(`Connected to the database: ${dbPath}`);

      // Create a promisified version of db.all for easier async usage
      const dbAll = promisify(db.all.bind(db));

      // Initialize the result object that will hold all tables
      const result: DatabaseResult = {};

      // First, get all table names
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        async (err, tables: Array<{ name: string }>) => {
          if (err) {
            reject(`Error getting table names: ${err.message}`);
            return;
          }

          try {
            // Process each table
            for (const table of tables) {
              const tableName = table.name;
              // console.log(`Processing table: ${tableName}`);

              // Get table schema information
              const tableInfo = (await dbAll(
                `PRAGMA table_info("${tableName}")`,
              )) as Array<{
                cid: number; // Column index/position (0-based)
                name: string; // Column name
                type: string; // Declared data type (TEXT, INTEGER, etc.)
                notnull: number; // 1 if NOT NULL constraint exists, 0 if NULL allowed
                dflt_value: unknown; // Default value or null if no default
                pk: number; // 1 if column is part of PRIMARY KEY, 0 otherwise
              }>;

              // Get all rows from the table
              const rows = (await dbAll(
                `SELECT * FROM "${tableName}"`,
              )) as Table["data"];

              // Initialize column type tracking
              const columnTypes: Record<string, Set<ColumnType>> = {};
              for (const column of tableInfo) {
                columnTypes[column.name] = new Set<ColumnType>();
              }

              // Process rows to determine column types
              for (const row of rows) {
                for (const columnName of Object.keys(row)) {
                  columnTypes[columnName].add(getValueType(row[columnName]));
                }
              }
              // rows.forEach((row: any) => {
              // 	Object.keys(row).forEach(columnName => {
              // 		columnTypes[columnName].add(getValueType(row[columnName]));
              // 	});
              // });

              // Convert Sets to arrays for JSON serialization
              const columns: Record<string, ColumnType[]> = {};
              for (const columnName of Object.keys(columnTypes)) {
                columns[columnName] = Array.from(columnTypes[columnName]);
              }
              // Object.keys(columnTypes).forEach(columnName => {
              // 	columns[columnName] = Array.from(columnTypes[columnName]);
              // });

              // Ensure every row has all columns (with undefined if missing)
              // This guarantees the type safety between columns and data
              const columnNames = Object.keys(columns);
              const normalizedData = rows.map((row) => {
                const normalizedRow: Table["data"][0] = {};

                // Add all known columns to each row, even if undefined
                for (const colName of columnNames) {
                  normalizedRow[colName] =
                    row[colName] !== undefined ? row[colName] : null;
                }
                // columnNames.forEach(colName => {
                // 	normalizedRow[colName] = row[colName] !== undefined ? row[colName] : null;
                // });

                return normalizedRow;
              });

              // For fully typed access in TypeScript, you can cast the result using:
              // const typedTable = result[tableName] as Table<typeof columns>;
              result[tableName] = {
                columns,
                data: normalizedData,
              };

              // console.log(
              // 	`Added ${rows.length} rows from table ${tableName} with ${Object.keys(columns).length} columns`,
              // );
            }

            // Close the database connection
            db.close((err) => {
              if (err) {
                reject(`Error closing database: ${err.message}`);
                return;
              }
              // console.log("Database connection closed");
              resolve(result); // Return the structured data object
            });
          } catch (error) {
            reject(`Error processing tables: ${error}`);
          }
        },
      );
    });
  });
}

export async function getSqlitePathForAgent(
  agent: string,
): Promise<string | undefined> {
  const { name } = readConfigFile();

  const files = await findSQLiteFiles(
    `./.wrangler/state/v3/do/${name}-${agent}`,
  );

  if (files.length === 0) {
    return;
  }

  return files[0];
}

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
