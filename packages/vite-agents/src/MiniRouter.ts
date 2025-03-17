import type { IncomingMessage, ServerResponse } from "node:http";

interface MiniRouterOptions {
  basePath?: string;
}

interface RoutePattern {
  regExp: RegExp;
  paramNames: string[];
}

interface Route {
  method: string;
  path: string;
  pattern: RoutePattern;
  handler: RouteHandler;
}

interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string>;
  req: IncomingMessage;
  res: ServerResponse;
  body?: unknown;
}

type NextFunction = () => void;
type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction,
) => void | Promise<void>;
type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
) => void | Promise<void>;

/**
 * A lightweight HTTP router inspired by Hono for use in Vite plugin middleware
 */
class MiniRouter {
  private basePath: string;
  private routes: Route[];
  private middlewares: Middleware[];

  constructor(options: MiniRouterOptions = {}) {
    this.basePath = options.basePath || "";
    this.routes = [];
    this.middlewares = [];
  }

  /**
   * Add middleware that runs before route handlers
   * @param middleware - (req, res, next) => void
   * @returns Returns this for chaining
   */
  use(middleware: Middleware): MiniRouter {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Add a route handler for a specific method and path
   * @param method - HTTP method (GET, POST, etc.)
   * @param path - Route path (can include params like /:id)
   * @param handler - (req, res, ctx) => void
   * @returns Returns this for chaining
   */
  on(method: string, path: string, handler: RouteHandler): MiniRouter {
    const fullPath = this.basePath + path;
    this.routes.push({
      method: method.toLowerCase(),
      path: fullPath,
      pattern: this._createPatternFromPath(fullPath),
      handler,
    });
    return this;
  }

  /**
   * Shorthand for GET routes
   */
  get(path: string, handler: RouteHandler): MiniRouter {
    return this.on("get", path, handler);
  }

  /**
   * Shorthand for POST routes
   */
  post(path: string, handler: RouteHandler): MiniRouter {
    return this.on("post", path, handler);
  }

  /**
   * Shorthand for PUT routes
   */
  put(path: string, handler: RouteHandler): MiniRouter {
    return this.on("put", path, handler);
  }

  /**
   * Shorthand for DELETE routes
   */
  delete(path: string, handler: RouteHandler): MiniRouter {
    return this.on("delete", path, handler);
  }

  /**
   * Shorthand for PATCH routes
   */
  patch(path: string, handler: RouteHandler): MiniRouter {
    return this.on("patch", path, handler);
  }

  /**
   * Shorthand for OPTIONS routes
   */
  options(path: string, handler: RouteHandler): MiniRouter {
    return this.on("options", path, handler);
  }

  /**
   * Create a RegExp pattern from a path string with named params
   * @param path - The path pattern (e.g., "/users/:id")
   * @returns { pattern: RegExp, paramNames: string[] }
   * @private
   */
  private _createPatternFromPath(path: string): RoutePattern {
    // Replace param patterns (:name) with capture groups
    const paramNames: string[] = [];
    const pattern = path
      .replace(/\/+$/, "") // Remove trailing slashes
      .replace(/\/:([^\/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "/([^/]+)";
      })
      // Replace * with a catch-all pattern
      .replace(/\*/g, ".*");

    // Create the final RegExp
    const regExp = new RegExp(`^${pattern}/?$`);

    return { regExp, paramNames };
  }

  /**
   * Checks if a route matches the request path and extracts params
   * @param route - Route object
   * @param method - HTTP method
   * @param path - Request path
   * @returns { params } or null if no match
   * @private
   */
  private _matchRoute(
    route: Route,
    method: string,
    path: string,
  ): { params: Record<string, string> } | null {
    // Check if the method matches
    if (route.method !== method.toLowerCase()) {
      return null;
    }

    // Check if the path matches the pattern
    const matches = path.match(route.pattern.regExp);
    if (!matches) {
      return null;
    }

    // Extract params from the path
    const params: Record<string, string> = {};
    if (route.pattern.paramNames.length > 0) {
      route.pattern.paramNames.forEach((name, i) => {
        params[name] = matches[i + 1];
      });
    }

    return { params };
  }

  /**
   * Creates a handler function for connect/express middleware
   * @returns (req, res, next) => void
   */
  handler(): (
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction,
  ) => Promise<void> {
    return async (
      req: IncomingMessage,
      res: ServerResponse,
      next: NextFunction,
    ) => {
      // Extract path and query string
      const urlString = req.url || "";
      const [path, queryString] = urlString.split("?");

      // Parse query parameters
      const query: Record<string, string> = {};
      if (queryString) {
        for (const pair of queryString.split("&")) {
          const [key, value] = pair.split("=");
          query[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
      }

      // Extract method
      const method = req.method || "GET";

      // Find a matching route
      let matchedRoute: Route | null = null;
      let routeParams: Record<string, string> = {};

      for (const route of this.routes) {
        const match = this._matchRoute(route, method, path);
        if (match) {
          matchedRoute = route;
          routeParams = match.params;
          break;
        }
      }

      // If no route matched, call next middleware
      if (!matchedRoute) {
        return next();
      }

      // Create context with params and query
      const ctx: RouteContext = {
        params: routeParams,
        query,
        req,
        res,
      };

      // Parse JSON body for POST/PUT/PATCH requests if needed
      if (
        ["post", "put", "patch"].includes(method.toLowerCase()) &&
        req.headers["content-type"]?.includes("application/json")
      ) {
        try {
          const bodyParser = (req: IncomingMessage): Promise<void> => {
            return new Promise((resolve, reject) => {
              let body = "";
              req.on("data", (chunk) => {
                body += chunk.toString();
              });
              req.on("end", () => {
                try {
                  // biome-ignore lint/suspicious/noExplicitAny: easiest way to set req.body
                  (req as any).body = JSON.parse(body);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
              req.on("error", reject);
            });
          };

          await bodyParser(req);
          // biome-ignore lint/suspicious/noExplicitAny: easiest way to set req.body
          ctx.body = (req as any).body;
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
          return;
        }
      }

      // Run middlewares
      let middlewareIndex = 0;

      const runMiddleware = async (): Promise<void> => {
        if (middlewareIndex < this.middlewares.length) {
          const middleware = this.middlewares[middlewareIndex++];

          return new Promise((resolve) => {
            middleware(req, res, () => {
              resolve(runMiddleware());
            });
          });
        }

        // After all middlewares, run the route handler
        // We've already checked that matchedRoute exists
        return await matchedRoute.handler(req, res, ctx);
      };

      try {
        await runMiddleware();
      } catch (error) {
        console.error("Error in router:", error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      }
    };
  }
}

export default MiniRouter;
