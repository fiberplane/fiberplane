import { type Env, Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { FiberplaneAppType } from "../../types.js";

export default function createAuthApiRoute<E extends Env>(apiKey: string) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  app.get("/authorize", async (c) => {
    const { embeddedUrl } = await getApp(apiKey);

    return c.redirect(
      `http://localhost:7676/api/auth/authorize?embeddedUrl=${encodeURIComponent(embeddedUrl)}`,
    );
  });

  app.get("/callback", async (c) => {
    const { embeddedUrl } = await getApp(apiKey);

    const sessionKey = c.req.query("session");
    if (!sessionKey) {
      throw new HTTPException(403, { message: "Session key missing" });
    }

    setCookie(c, "fpSession", sessionKey);
    return c.redirect(embeddedUrl);
  });

  app.get("/profile", async (c) => {
    const sessionKey = getCookie(c, "fpSession");

    const response = await fetch("http://localhost:7676/api/auth/profile", {
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionKey}`,
      },
    });
    const json = await response.json();
    return json;
  });

  return app;
}

async function getApp(apiKey: string) {
  const response = await fetch("http://localhost:7676/api/auth/app", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const app = await response.json();

  if (!app) {
    throw new Error("Invalid api key");
  }

  // TODO:
  return app as { embeddedUrl: string };
}
