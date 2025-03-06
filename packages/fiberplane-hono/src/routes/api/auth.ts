import { type Env, Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { FetchFn, FiberplaneAppType } from "../../types";

export default function createAuthApiRoute<E extends Env>(
  apiKey: string,
  fetchFn: FetchFn,
  fiberplaneServicesUrl: string,
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  app.get("/authorize", async (c) => {
    const { embeddedUrl } = await getApp(
      apiKey,
      fetchFn,
      fiberplaneServicesUrl,
    );

    return c.redirect(
      `${fiberplaneServicesUrl}/api/auth/authorize?embeddedUrl=${encodeURIComponent(embeddedUrl)}`,
    );
  });

  app.get("/callback", async (c) => {
    const { embeddedUrl } = await getApp(
      apiKey,
      fetchFn,
      fiberplaneServicesUrl,
    );

    const sessionKey = c.req.query("session");
    if (!sessionKey) {
      throw new HTTPException(403, { message: "Session key missing" });
    }

    setCookie(c, "fpSession", sessionKey);
    return c.redirect(embeddedUrl);
  });

  app.get("/profile", async (c) => {
    const sessionKey = getCookie(c, "fpSession");

    const response = await fetchFn(
      `${fiberplaneServicesUrl}/api/auth/profile`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${sessionKey}`,
        },
      },
    );
    const json = await response.json();
    return c.json(json);
  });

  return app;
}

async function getApp(
  apiKey: string,
  fetchFn: FetchFn,
  fiberplaneServicesUrl: string,
) {
  const response = await fetchFn(`${fiberplaneServicesUrl}/api/auth/app`, {
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
