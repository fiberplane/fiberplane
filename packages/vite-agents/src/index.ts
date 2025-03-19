// Re-export utility functions
export {
  getDurableObjectsFromConfig,
  readConfigFile,
  getSqlitePathForAgent,
  serializeSQLiteToJSON,
} from "./vite/utils";
import { Agent } from "agents-sdk";

import { tool, type Tool } from "ai";
import { z } from "zod";

// Re-export types
export * from "./vite/types";


// Tool definition with serializable properties
export interface SerializableTool {
  id: string;
  name: string;
  description: string;
  parameters: string; // JSON string of parameters schema
}

// Type for tool with name when saving to database
export type ToolWithName = {
  name: string;
  tool: Tool;
};

export class FiberAgent<Env, State = Record<string, unknown>> extends Agent<Env, State> {
  /**
   * Initialize the Agent database tables if they don't exist yet
   */
  async initTables(): Promise<void> {
    try {
      // Table for model choice
      await this.sql`CREATE TABLE IF NOT EXISTS cf_agents_model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      // Table for system instructions
      await this.sql`CREATE TABLE IF NOT EXISTS cf_agents_system_instructions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      // Table for tools
      await this.sql`CREATE TABLE IF NOT EXISTS cf_agents_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        parameters TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    } catch (error) {
      console.error("Error initializing tables:", error);
      throw error;
    }
  }

  /**
   * Set the model to use for the agent
   */
  async setModel(modelName: string): Promise<void> {
    try {
      await this.sql`INSERT INTO cf_agents_model (model_name) VALUES (${modelName})`;
    } catch (error) {
      console.error("Error setting model:", error);
      throw error;
    }
  }

  /**
   * Get the most recently set model
   */
  async getModel(): Promise<string | null> {
    try {
      const models = await this.sql<{ model_name: string }>`
        SELECT model_name FROM cf_agents_model
        ORDER BY created_at DESC LIMIT 1
      `;
      
      return models.length > 0 ? models[0].model_name : null;
    } catch (error) {
      console.error("Error getting model:", error);
      throw error;
    }
  }

  /**
   * Set the system instructions for the agent
   */
  async setSystemInstructions(content: string): Promise<void> {
    try {
      await this.sql`INSERT INTO cf_agents_system_instructions (content) VALUES (${content})`;
    } catch (error) {
      console.error("Error setting system instructions:", error);
      throw error;
    }
  }

  /**
   * Get the most recently set system instructions
   */
  async getSystemInstructions(): Promise<string | null> {
    try {
      const instructions = await this.sql<{ content: string }>`
        SELECT content FROM cf_agents_system_instructions
        ORDER BY created_at DESC LIMIT 1
      `;
      
      return instructions.length > 0 ? instructions[0].content : null;
    } catch (error) {
      console.error("Error getting system instructions:", error);
      throw error;
    }
  }

  /**
   * Save a tool to the database
   * Since we can't serialize the execute function, we only store the tool's metadata
   * The execute function will need to be provided at runtime
   */
  async saveTool(toolData: ToolWithName): Promise<void> {
    try {
      const toolId = toolData.name || crypto.randomUUID();
      const parameters = JSON.stringify(toolData.tool.parameters);
      
      await this.sql`
        INSERT INTO cf_agents_tools (tool_id, name, description, parameters)
        VALUES (
          ${toolId}, 
          ${toolData.name || ''}, 
          ${toolData.tool.description || ''}, 
          ${parameters}
        )
        ON CONFLICT (tool_id) DO UPDATE
        SET name = ${toolData.name || ''}, 
            description = ${toolData.tool.description || ''}, 
            parameters = ${parameters}
      `;
    } catch (error) {
      console.error("Error saving tool:", error);
      throw error;
    }
  }

  /**
   * Get all tools from the database
   * Note: This only returns the metadata, not the execute function
   */
  async getTools(): Promise<SerializableTool[]> {
    try {
      const tools = await this.sql<SerializableTool>`
        SELECT tool_id as id, name, description, parameters
        FROM cf_agents_tools
      `;
      
      return tools;
    } catch (error) {
      console.error("Error getting tools:", error);
      throw error;
    }
  }

  /**
   * Delete a tool by ID
   */
  async deleteTool(toolId: string): Promise<void> {
    try {
      await this.sql`DELETE FROM cf_agents_tools WHERE tool_id = ${toolId}`;
    } catch (error) {
      console.error("Error deleting tool:", error);
      throw error;
    }
  }
  
  /**
   * Initialize the Agent - call this in your Agent constructor or onConnect
   */
  async initialize(): Promise<void> {
    await this.initTables();
  }
}
