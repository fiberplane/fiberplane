import { type Env, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { FetchFn, FiberplaneAppType } from "../../types";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

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

    const url = new URL(c.req.url);
    const isDev = url.host === "localhost";

    const cookieOptions = {
      httpOnly: true,
      secure: !isDev,
      maxAge: COOKIE_MAX_AGE,
      sameSite: "Lax" as const,
      domain: url.hostname,
    };

    setCookie(c, "fpSession", sessionKey, cookieOptions);
    return c.redirect(embeddedUrl);
  });

  app.post("/logout", async (c) => {
    const sessionKey = getCookie(c, "fpSession");

    if (sessionKey) {
      // Remove session cookie from embedded app domain
      deleteCookie(c, "fpSession");

      // Invalidate session with auth server
      await fetchFn(`${fiberplaneServicesUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Cookie: `session=${sessionKey}`,
        },
      });
    }

    return c.json({ success: true });
  });

  app.get("/profile", async (c) => {
    const sessionKey = getCookie(c, "fpSession");

    const response = await fetchFn(
      `${fiberplaneServicesUrl}/api/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Cookie: `session=${sessionKey}`,
        },
      },
    );

    if (response.ok) {
      const json = await response.json();
      return c.json(json);
    }

    return c.json({ message: "Unauthorized" }, 401);
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
