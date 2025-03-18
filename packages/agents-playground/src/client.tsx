import React from "react";
import ReactDOM from "react-dom/client";
import { App, ThemeProvider } from "./components";
import "./main.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<QueryClientProvider client={queryClient}>
					<div className="bg-background text-foreground text-sm min-h-dvh min-w-dvw grid p-2">
						<App />
					</div>
				</QueryClientProvider>
			</ThemeProvider>
		</React.StrictMode>,
	);
} else {
	console.error("Root element not found");
}
