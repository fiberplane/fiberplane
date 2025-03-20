import "./styles.css";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";
import App from "./app";

const root = createRoot(document.getElementById("app")!);

root.render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>,
);
