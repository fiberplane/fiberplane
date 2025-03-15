import { Hono } from "hono";
import Agents from "./agents";

const app = new Hono();

app.route("/agents", Agents);

export default app;
