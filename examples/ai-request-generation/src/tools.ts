// https://developers.cloudflare.com/workers-ai/function-calling/
export const makeRequestToolHermes = {
  name: "make_request",
  description:
    "Generates some random data for an http request to an api backend",
  // Describe parameters as json schema https://json-schema.org/understanding-json-schema/
  parameters: {
    type: "object" as const,
    properties: {
      path: {
        type: "string" as const,
      },
      pathParams: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            key: {
              type: "string",
            },
            value: {
              type: "string",
            },
          },
        },
      },
      queryParams: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            key: {
              type: "string" as const,
            },
            value: {
              type: "string" as const,
            },
          },
        },
      },
      body: {
        type: "string" as const,
      },
      headers: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            key: {
              type: "string" as const,
            },
            value: {
              type: "string" as const,
            },
          },
        },
      },
    },
    // TODO - Mark fields like `pathParams` as required based on the route definition?
    required: ["path"],
  },
};
