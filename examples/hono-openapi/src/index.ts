import { createFiberplane } from "@fiberplane/hono";
import { instrument } from "@fiberplane/hono-otel";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { basicAuth } from "hono/basic-auth";
import z from "zod";
import * as schema from "./db/schema";
import "zod-openapi/extend";

// TODO - Figure out how to use drizzle with "@hono/zod-openapi"
//
// import { UserSchema } from "./db/schema";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Schema that defines presence of an ID in the path
const UserIdPathParamSchema = z.object({
  id: z
    // Path params are always strings
    .string()
    // But an ID is always a number
    .regex(/^\d+$/)
    .openapi({
      description: "The ID of the user",
      example: "123",
    }),
});

// Schema that defines the body of a request to create a new user
const NewUserSchema = z
  .object({
    name: z.string().openapi({
      example: "John Doe",
      description: "The name of the user",
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi({
    ref: "NewUser",
  });

// Schema that defines the response of a request to get a user
// TODO - Figure out how to extend the NewUserSchema object
const UserSchema = z
  .object({
    id: z.number().openapi({
      example: 123,
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi({
    ref: "User",
  });

// Define the route to get a user by ID
app.get(
  "/users/:id",
  describeRoute({
    responses: {
      200: {
        description: "Retrieve the user",
        content: {
          "application/json": {
            schema: resolver(UserSchema),
          },
        },
      },
      400: {
        description: "Invalid ID",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                error: z.string(),
              }),
            ),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(z.object({ error: z.string() })),
          },
        },
      },
    },
  }),
  zValidator("param", UserIdPathParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = drizzle(c.env.DB);

    const idNumber = +id;
    if (Number.isNaN(idNumber) || idNumber < 1) {
      return c.json({ error: "Invalid ID" }, 400);
    }

    const [result] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, idNumber));

    if (!result) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result, 200);
  },
);

// Define the route to list users
app.get(
  "/users",
  describeRoute({
    description: "List all users",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: resolver(z.array(UserSchema)),
          },
        },
        description: "List all users",
      },
    },
  }),
  zValidator("query", z.object({ name: z.string().optional() })),
  async (c) => {
    const { name } = c.req.valid("query");
    const db = drizzle(c.env.DB);

    // Only apply where clause if name is provided and not empty
    const query = db.select().from(schema.users);
    if (name && name.trim() !== "") {
      query.where(eq(schema.users.name, name));
    }

    const result = await query;
    return c.json(result, 200);
  },
);

// Define the route to create a new user
app.post(
  "/users",
  describeRoute({
    description: "Create a new user",
    responses: {
      201: {
        description: "Newly created user",
        content: {
          "application/json": {
            schema: resolver(UserSchema),
          },
        },
      },
    },
  }),
  zValidator("json", NewUserSchema),
  async (c) => {
    const { name, age } = c.req.valid("json");
    const db = drizzle(c.env.DB);
    const [result] = await db
      .insert(schema.users)
      .values({
        name,
        age,
      })
      .returning();
    return c.json(result, 201);
  },
);

// Define the route to delete a user by ID
// Add in basic auth middleware to the route to show how to add security to an endpoint
app.delete(
  "/users/:id",
  describeRoute({
    security: [
      {
        basicAuth: [],
      },
    ],
    responses: {
      204: {
        description: "User deleted",
      },
      401: {
        description: "Unauthorized - Invalid credentials",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                error: z.string(),
              }),
            ),
          },
        },
      },
    },
  }),
  basicAuth({
    username: "goose",
    password: "honkhonk",
  }),
  zValidator("param", UserIdPathParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = drizzle(c.env.DB);
    await db.delete(schema.users).where(eq(schema.users.id, +id));
    return c.body(null, 204);
  },
);

// Mount the api documentation
// The OpenAPI documentation will be available at /doc
app.get(
  "/doc",
  openAPISpecs(app, {
    documentation: {
      info: {
        version: "1.0.0",
        title: "Simple Hono OpenAPI API",
      },
    },
  }),
);

// Define a simple route to test the API (this is not part of the OpenAPI spec)
app.get("/", (c) => {
  return c.html(
    'Hello Hono OpenAPI! Visit <a href="/fp">/fp</a> to see the Fiberplane api explorer.',
  );
});

// Mount the Fiberplane middleware
app.use(
  "/fp/*",
  createFiberplane({
    openapi: { url: "/doc" },
  }),
);

export default instrument(app);
