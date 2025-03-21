import "./styles.css";
import { NuqsAdapter } from "nuqs/adapters/react";
import { createRoot } from "react-dom/client";
import App from "./app";

const root = createRoot(document.getElementById("app")!);

root.render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>,
);
