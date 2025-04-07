import "./styles.css";
import { NuqsAdapter } from "nuqs/adapters/react";
import { createRoot } from "react-dom/client";
import App from "./app";

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Could not find element with id 'app'");
}
const root = createRoot(appElement);

root.render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>,
);
