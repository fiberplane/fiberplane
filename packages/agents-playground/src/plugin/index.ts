// vite-plugin-custom-endpoints.js
// import fs from "node:fs";
// import mime from "mime-types";
import type { FSWatcher, ViteDevServer } from "vite";
import { WebSocketServer, type WebSocket } from "ws";
// import { URL } from "node:url";
import { getDurableObjectsFromConfig, readConfigFile } from "../api/utils";
import MiniRouter from "./MiniRouter";
import { getSqlitePathForAgent, serializeSQLiteToJSON } from "./utils";
import type { IncomingMessage } from "node:http";
import { MessageSchema } from "../types";

type Options = {
	// endpoints?: EndpointConfig[];
	basePath?: string;
	// staticOptions?: StaticOptions;
};

let _id = 0;
function generateId(): number {
	_id += 1;
	return _id;
}

export default function customEndpointsPlugin(options: Options = {}) {
	const {
		basePath = "/fp-agents", // base path for all endpoints
		// staticOptions = {    // static file serving options
		//   enabled: false,
		//   root: '',          // root directory to serve files from
		//   prefix: '/static', // URL prefix for static files
		//   index: ['index.html', 'index.htm'] // index files to look for
		// }
	} = options;

	const websocketOptions = {
		path: `${basePath}/ws`,
		heartbeat: true,
		heartbeatInterval: 30000,
	};

	const router = new MiniRouter({
		basePath,
	});

	router.get("/api/agents", (req, res) => {
		const result = getDurableObjectsFromConfig();

		res.setHeader("Content-Type", "application/json");
		if (result.success === false) {
			res.statusCode = 500;
			res.end(JSON.stringify(result));
		}

		res.statusCode = 200;
		res.end(JSON.stringify(result));
	});

	router.get("/api/agents/:id/db", async (_req, res, ctx) => {
		const id = ctx.params.id;
		const filePath = await getSqlitePathForAgent(id);
		if (filePath === undefined) {
			res.statusCode = 404;
			res.end(JSON.stringify({ error: "No database found" }));
			return;
		}

		const result = await serializeSQLiteToJSON(filePath);
		res.setHeader("Content-Type", "application/json");
		res.statusCode = 200;
		res.end(JSON.stringify(result));
	});

	return {
		name: "vite-plugin-custom-endpoints",
		async configureServer(server: ViteDevServer) {
			server.middlewares.use(router.handler());

			type SocketInfo = {
				isAlive: boolean;
				id: number;
				ws: WebSocket;
			};

			type WebSocketHandlers<M = unknown> = {
				connection: (
					info: SocketInfo,
					req: IncomingMessage,
					clients: Set<SocketInfo>,
				) => void;
				message: (
					info: SocketInfo,
					message: M,
					clients: Set<SocketInfo>,
				) => void | Promise<void>;
				close: (info: SocketInfo, clients: Set<SocketInfo>) => void;
				error: (
					info: SocketInfo,
					error: Error,
					clients: Set<SocketInfo>,
				) => void;
			};
			// Store connected clients with optional metadata
			const clients = new Set<SocketInfo>();
			const watchPaths: Record<
				string,
				{
					watcher: Promise<FSWatcher>;
					ids: Array<number>;
				}
			> = {};

			const startWatching = (agent: string) => {
				return getSqlitePathForAgent(agent).then(async (foundFile) => {
					// if (!foundFile) {
					// 	// throw new Error("No database found");
					// }

					let file = foundFile;
					if (!file) {
						const { name } = readConfigFile("./wrangler.toml");
						file = `./data/${name}-${agent}.sqlite`;
					}

					const watcher = server.watcher.add(file);
					watcher.on("change", (path) => {
						if (!path.endsWith(file)) {
							// console.log('change', file, path)
							return;
						}
						const watchPath = watchPaths[agent];
						// console.log('change', event, watchPath)
						if (!watchPath) {
							console.error("No watcher found for agent", agent);
							return;
						}

						const ids = watchPath.ids;
						console.log(
							"Change detected in database",
							{ file, path },
							ids,
							// Array.from([...clients].map((info) => info.id)),
						);
						for (const id of ids) {
							const info = clients
								.values()
								.find((info) => info.id === Number(id));
							if (!info) {
								console.error("Client not found for WebSocket message", id);
								continue;
							}

							console.log("send update");
							info.ws.send(
								JSON.stringify({ type: "update", payload: { agent } }),
							);
						}
					});
					return watcher;
				});
			};

			const result = getDurableObjectsFromConfig();
			// console.log("Durable Objects found:", result);
			if (!result.success) {
				console.error("Error getting Durable Objects:", result.error);
				return;
			}

			for (const binding of result.durableObjects.bindings) {
				watchPaths[binding.name] = {
					watcher: startWatching(binding.name),
					ids: [],
				};
			}

			// WebSocket event handlers
			const wsHandlers: WebSocketHandlers<Message> = {
				connection: () => { },
				message: async (info: SocketInfo, message: Message) => {
					switch (message.type) {
						case "subscribe": {
							const watchPath = watchPaths[message.payload.agent] ?? {
								watcher: startWatching(message.payload.agent),
								ids: [],
							};

							watchPaths[message.payload.agent] = watchPath;
							console.log("subscribing", info.id);
							watchPath.ids.push(info.id);
							break;
						}
						case "unsubscribe": {
							const watchPath = watchPaths[message.payload.agent];
							if (!watchPath) {
								console.error(
									"No watcher found for agent",
									message.payload.agent,
								);
								return;
							}

							watchPath.ids = watchPath.ids.filter((id) => id !== info.id);
							break;
						}
					}
				},
				close: () => { },
				error: () => { },
			};

			// Use the existing HTTP server from Vite
			const httpServer = server.httpServer;

			if (!httpServer) {
				console.error(
					"Cannot setup WebSocket server: Vite HTTP server not available",
				);
				return;
			}

			// Create a WebSocket server
			const wss = new WebSocketServer({
				// noServer: true,
				port: 4001,
				path: websocketOptions.path,
			});


			// Handle new WebSocket connections
			wss.on("connection", (ws, req) => {
				console.log("WebSocket client connected");

				// Add client to the set with metadata
				const info: SocketInfo = {
					isAlive: true,
					id: generateId(),
					ws,
				};
				clients.add(info);
				console.log("adding client", info.id);
				// Ping-pong heartbeat
				if (websocketOptions.heartbeat) {
					ws.on("pong", () => {
						info.isAlive = true;
					});
				}

				// Setup message handler
				ws.on("message", (message) => {
					const stringMessage =
						message instanceof Buffer
							? new TextDecoder().decode(message)
							: message.toString();
					try {
						// Try to parse JSON messages
						let parsedMessage: unknown;
						try {
							parsedMessage = JSON.parse(stringMessage);
						} catch (e) {
							parsedMessage = stringMessage;
						}

						const result = MessageSchema.safeParse(parsedMessage);
						if (!result.success) {
							console.error("Invalid message received", result.error);
							return;
						}

						console.log('inside message');
						const info = [...clients].find((info) => info.ws === ws);
						if (!info) {
							console.error("Client not found for WebSocket message");
							return;
						}
						// Call the user-defined message handler
						wsHandlers.message(info, result.data, clients);
					} catch (error) {
						console.error("Error handling WebSocket message:", error);
					}
				});

				// Setup close handler
				ws.on("close", (event) => {
					console.log('in close');
					const info = [...clients].find((info) => info.ws === ws);
					console.log("WebSocket client disconnected", info?.id, event);
					if (!info) {
						console.warn("info not found for WebSocket close");
						return;
					}
					console.log("removing client", info.id);
					clients.delete(info);
					wsHandlers.close(info, clients);
				});

				// Setup error handler
				ws.on("error", (error) => {
					console.error("WebSocket error:", error);
					const info = [...clients].find((info) => info.ws === ws);
					if (!info) {
						console.warn("info not found for WebSocket error");
						return;
					}

					wsHandlers.error(info, error, clients);
				});

				// Call the user-defined connection handler
				wsHandlers.connection(info, req, clients);
			});

			// Setup heartbeat interval if enabled
			if (websocketOptions.heartbeat) {
				const interval = setInterval(() => {
					// wss.clients.forEach((ws) => {
					for (const info of clients) {
						if (info.isAlive === false) {
							console.log("Terminating WebSocket connection", info);
							clients.delete(info);
							return info.ws.terminate();
						}

						info.isAlive = false;
						info.ws.ping(() => { });
					}
				}, websocketOptions.heartbeatInterval);

				wss.on("close", () => {
					console.log("shutting down server");
					clearInterval(interval);
				});
			}

			// // Handle upgrade requests to establish WebSocket connections
			// httpServer.on("upgrade", (request, socket, head) => {
			// 	if (request.url.startsWith(websocketOptions.path)) {
			// 		wss.handleUpgrade(request, socket, head, (ws) => {
			// 			wss.emit("connection", ws, request);
			// 		});
			// 	}
			// });

			console.log(`WebSocket server running at path: ${websocketOptions.path}`);

			// // Set up static file serving if enabled
			// if (staticOptions.enabled && staticOptions.root) {
			//   const staticRoot = staticOptions.root;
			//   const staticPrefix = staticOptions.prefix || '/static';

			//   console.log(`Serving static files from ${staticRoot} at ${staticPrefix}`);

			//   // Create a middleware to handle static file requests
			//   server.middlewares.use(staticPrefix, (req, res, next) => {
			//     // Extract the file path from the URL, removing the prefix
			//     let urlPath = req.url;

			//     // Remove query string if present
			//     if (urlPath.includes('?')) {
			//       urlPath = urlPath.split('?')[0];
			//     }

			//     // Prevent directory traversal attacks
			//     if (urlPath.includes('..')) {
			//       res.statusCode = 403;
			//       return res.end('Forbidden');
			//     }

			//     // Calculate the file path relative to the static root
			//     const filePath = path.join(staticRoot, urlPath);

			//     // Check if the file exists
			//     fs.stat(filePath, (err, stats) => {
			//       if (err) {
			//         // File not found, pass to next middleware
			//         return next();
			//       }

			//       // If it's a directory, look for index files
			//       if (stats.isDirectory()) {
			//         // Try to find an index file
			//         for (const indexFile of staticOptions.index) {
			//           const indexPath = path.join(filePath, indexFile);
			//           if (fs.existsSync(indexPath)) {
			//             return serveFile(indexPath, res);
			//           }
			//         }

			//         // No index file found
			//         res.statusCode = 404;
			//         return res.end('Not Found');
			//       }

			//       // Serve the file
			//       serveFile(filePath, res);
			//     });
			//   });
		},
	};
}

// // Helper function to serve a static file
// function serveFile(filePath, res) {
//   // Determine content type
//   const contentType = mime.lookup(filePath) || "application/octet-stream";

//   // Set response headers
//   res.setHeader("Content-Type", contentType);

//   // Stream the file to the response
//   const fileStream = fs.createReadStream(filePath);
//   fileStream.pipe(res);

//   // Handle file stream errors
//   fileStream.on("error", (error) => {
//     console.error(`Error streaming file: ${error.message}`);
//     res.statusCode = 500;
//     res.end("Internal Server Error");
//   });
// }
// // };
// // }
