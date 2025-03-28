import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components";
import { parseOptions } from "./lib/utils";
import { routeTree } from "./routeTree.gen";
import "./main.css";

// Create a client
const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const options = await parseOptions(rootElement);

const router = createRouter({
  routeTree,
  basepath: options.mountedPath,
  context: {
    ...options,
    queryClient,
  },
  defaultPreload: "viewport",
  defaultPreloadStaleTime: 10 * 1000,
});

// Provide type safety for the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
