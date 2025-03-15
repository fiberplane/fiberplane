import {
	Agent,
	type AgentContext,
	type Connection,
	type ConnectionContext,
	type WSMessage,
} from "agents-sdk";
import packageJson from "../../package.json";
import { generateText, tool, type LanguageModelV1, type ToolSet } from "ai";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { z } from "zod";
import { createMessages } from "./utils";

type GenerateTextParams = Parameters<typeof generateText>[0];
const dependencies = packageJson.dependencies;
// export type Env = {
//   Chat: AgentNamespace<Chat>;
//   GOOGLE_GENERATIVE_AI_API_KEY: string;
//   OPENAI_API_KEY: string;
// };

export type Env = {
	GOOGLE_GENERATIVE_AI_API_KEY: string;
	OPENAI_API_KEY: string;
	Chat: DurableObjectNamespace<Chat>;
	DB: D1Database;
};

const FindDatabase = tool({
	description: "Find the database being used in the project.",
	parameters: z.object({}),
	execute: async () => {
		const names = Object.keys(dependencies);
		if (names.find((item) => item.toLowerCase().includes("mongodb"))) {
			return {
				type: "text",
				text: "The database being used is MongoDB",
			};
		}

		return {
			type: "text",
			text: "Type of DB is unknown",
		};
	},
});

const ListDependencies = tool({
	description:
		"List the dependencies in tha package.json file. This can help figure out what database is being used.",
	parameters: z.object({}),
	execute: async () => {
		try {
			// const packageJson = await fetch("../package.json").then((res) => res.json());
			// const dependencies = packageJson.dependencies;
			const packages = Object.entries(dependencies).map(
				([name, version]) => `${name}@${version}`,
			);
			return {
				type: "text",
				text: `Here are the npm packages: 
${packages.length ? `* ${packages.join("* ")}` : "No dependencies found"}`,
			};
		} catch (error) {
			console.error("Not working", error);
		}
		return {
			type: "text",
			text: "Failed to retrieve a list of dependencies",
		};
	},
});

const tools: ToolSet = {
	list_dependencies: ListDependencies,
	// "find_database": FindDatabase,
};
// Define your agent classes
export class Chat extends Agent<
	Env,
	{
		messageReceived: string;
	}
> {
	initialState = {
		messageReceived: "none",
	};
	private apiKey: string;
	// Override constructor so we can store the `GOOGLE_GENERATIVE_AI_API_KEY` env var
	constructor(ctx: AgentContext, env: Env) {
		super(ctx, env);
		this.apiKey = env.OPENAI_API_KEY;
	}

	private _model: LanguageModelV1 | null = null;
	private _openai: OpenAIProvider | null = null;
	// Called when an Agent is started (or woken up)
	async onStart() {
		console.log("Agent started", this.state);

		this._openai = createOpenAI({
			apiKey: this.apiKey,
		});
		this._model = this._openai("gpt-4o");
	}

	// Called when a WebSocket connection is established
	async onConnect(connection: Connection, ctx: ConnectionContext) {
		console.log(
			"Connected!",
			connection.id,
			connection.readyState === WebSocket.OPEN,
		);
		this.setState({ messageReceived: connection.id });
		connection.send(JSON.stringify("Hello, from server world!"));
	}

	// // Called for each message received on the WebSocket connection
	async onMessage(connection: Connection, message: WSMessage): Promise<void> {
		console.log(
			`message from client ID: ${connection.id} `,
			message.toString(),
		);
		connection.send(JSON.stringify("ACK"));
		this.setState({
			messageReceived: "yes",
		});

		if (this._model) {
			const params: GenerateTextParams = {
				model: this._model,
				tools,
				messages: createMessages(message.toString()),
				experimental_activeTools: ["list_dependencies"],
				maxSteps: 5,
				experimental_continueSteps: true,
			};
			try {
				const result = await generateText(params);
				console.log("------------------");
				console.log("Done", result.text);
			} catch (error) {
				console.error("Failed", error);
			}
		}
	}

	// // WebSocket error and disconnection (close) handling.
	async onError(connection: Connection, error: unknown) {
		console.error(`WS error: ${error} `);
	}

	async onClose(
		connection: Connection,
		code: number,
		reason: string,
		wasClean: boolean,
	) {
		console.log(`WS closed: ${code} - ${reason} - wasClean: ${wasClean} `);
		connection.close();
	}
}
