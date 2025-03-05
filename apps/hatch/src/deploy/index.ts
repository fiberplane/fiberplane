import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { rollup } from "rollup"
import virtual from "@rollup/plugin-virtual";

export interface DeployWorkflowParams {
	projectId: string;
}

export class DeployWorkflow extends WorkflowEntrypoint<CloudflareBindings> {
	async run(
		event: Readonly<WorkflowEvent<DeployWorkflowParams>>,
		step: WorkflowStep,
	): Promise<void> {
		const { projectId } = event.payload;

		// 1. retrieve project files from KV
		const projectFiles: Record<string, string> = await step.do(
			"retrieve-files",
			async () => {
				try {
					const projectFilesStr = await this.env.projects.get(projectId);
					if (!projectFilesStr) {
						throw new Error(`Project ${projectId} not found`);
					}
					return JSON.parse(projectFilesStr);
				} catch (error) {
					throw new NonRetryableError(
						"Failed to retrieve and parse project files",
					);
				}
			},
		);

		console.log("projectFiles", projectFiles);

		// 2. Bundle the app using rollup with virtual plugin
		const bundledApp = await step.do("bundle-app", async () => {
			const fileKeys = Object.keys(projectFiles);

			if (fileKeys.length === 0) {
				throw new NonRetryableError("No files found in the project");
			}

			// Find the entry point file (assuming it contains "index")
			const entryPointFile = fileKeys.find((file) => file.includes("index"));

			if (!entryPointFile) {
				throw new NonRetryableError("No entry point file found (looking for a file containing 'index')");
			}

			try {
				console.log(`Using ${entryPointFile} as entry point`);
				
				// Create the rollup bundle
				const bundle = await rollup({
					input: entryPointFile,
					plugins: [
						virtual(projectFiles)
					],
					onwarn(warning, warn) {
						console.warn(`Rollup warning: ${warning.code} - ${warning.message}`);
					}
				});

				// Generate the output
				const { output } = await bundle.generate({
					format: "esm",
					sourcemap: false,
				});

				// Close the bundle
				await bundle.close();

				console.log(`Generated ${output.length} output chunks`);
				
				// Return the bundled code
				return output.map((chunk) => {
					if (chunk.type === "chunk") {
						console.log(`Chunk: ${chunk.fileName}, size: ${chunk.code.length}`);
						return {
							fileName: chunk.fileName,
							type: chunk.type,
							code: chunk.code,
						};
					}

					console.log(`Asset: ${chunk.fileName}`);
					return {
						fileName: chunk.fileName,
						type: chunk.type,
						source: chunk.source,
					};
				});
			} catch (error: unknown) {
				console.error("Rollup bundling error:", error);
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				throw new NonRetryableError(
					`Failed to bundle project: ${errorMessage}`,
				);
			}
		});

		// 3. deploy bundle to Cloudflare Worker
		await step.do("deploy-bundle", async () => {
			console.log("WE DEPLOYING THIS BUNDLE: \n", bundledApp);
			// FIXME: implement deployment using bundledCode
		});
	}
}
