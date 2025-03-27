import React from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "./components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routes/routeTree.gen";
import "./main.css";

// Create a client
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  basepath: "/fp", // FIXME: This should be dynamic
  defaultPreload: "intent",
  defaultPreloadStaleTime: 10 * 1000,
});

// Provide type safety for the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
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
