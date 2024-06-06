import { IGNORE_MIZU_LOGGER_LOG, errorToJson, generateUUID } from "./utils";

/**
 * Hacky function that monkey-patches fetch to send data about network requests to mizu.
 *
 * We log data with the `IGNORE_MIZU_LOGGER_LOG` symbol in order to avoid printing it to the user's console.
 * That symbol is used by the monkey-patched console.* methods to avoid _actually_ printing the logs to the console.
 * Seem confusing? Yes. Yes it is. However, relying on our monkey-patched console.* methods allows us to make use of the current traceId, etc.
 *
 * This function also has an option to skip monkey-patching, so that the user can configure whether or not to use this functionality.
 *
 * Returns the original fetch (the fetch we're monkey patching), so the middleware can still use it to send log data to mizu.
 * Returns an `undo` function, so that the middleware can undo the monkey-patching after the request is finished.
 * (This "undo" functionality is really important in cloudflare workers!)
 *
 * In future, when writing an otel-compatible version of this, we should take inspo from:
 *
 * https://github.com/evanderkoogh/otel-cf-workers/blob/6f1c79056776024fd3e816b9e3991527e7217510/src/instrumentation/fetch.ts#L198
 */
export function replaceFetch({
  skipMonkeyPatch,
}: { skipMonkeyPatch: boolean }) {
  const originalFetch = globalThis.fetch;

  if (skipMonkeyPatch) {
    return { originalFetch, undo: () => {} };
  }

  // @ts-ignore
  globalThis.fetch = async (...args) => {
    const requestId = generateUUID();
    const start = Date.now();
    const {
      url,
      method,
      body,
      headers: requestHeaders,
    } = await getRequestData(...args);

    console.log(
      JSON.stringify({
        lifecycle: "fetch_start",
        requestId,
        start,
        url, // Parsed URL
        method, // Parsed method
        body, // Parsed body
        headers: requestHeaders, // Parsed headers
        args, // Full request args
      }),
      IGNORE_MIZU_LOGGER_LOG,
    );

    try {
      const response = await originalFetch(...args);
      const end = Date.now();
      const elapsed = end - start;

      const clonedResponse = response.clone();

      if (!clonedResponse.ok) {
        const { body, headers, status, statusText } =
          // @ts-ignore: weird type conflict between cloned response and `Response` type
          await getResponseData(clonedResponse);

        // Count any not-ok responses as a fetch_error
        console.error(
          JSON.stringify({
            lifecycle: "fetch_error",
            requestId,
            status,
            statusText,
            body,
            url,
            headers,
            end,
            elapsed,
          }),
          IGNORE_MIZU_LOGGER_LOG,
        );
      }

      const { body, headers, status, statusText } =
        // @ts-ignore: weird type conflict between cloned response and `Response` type
        await getResponseData(clonedResponse);

      console.log(
        JSON.stringify({
          lifecycle: "fetch_end",
          requestId,
          end,
          elapsed,
          url,
          status,
          statusText,
          headers,
          body,
        }),
        IGNORE_MIZU_LOGGER_LOG,
      );

      return response;
    } catch (err) {
      console.error(
        JSON.stringify({
          lifecycle: "fetch_logging_error",
          requestId,
          url,
          error: err instanceof Error ? errorToJson(err) : err,
        }),
        IGNORE_MIZU_LOGGER_LOG,
      );
      throw err;
    }
  };

  return {
    undo: () => {
      globalThis.fetch = originalFetch;
    },
    originalFetch,
  };
}

async function tryGetResponseBodyAsText(response: Response) {
  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getResponseHeaders(clonedResponse: Response) {
  // Extract and format response headers
  const headers: { [key: string]: string } = {};
  clonedResponse.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

async function getRequestData(...args: Parameters<typeof fetch>) {
  const [resource, init] = args;
  const method = init?.method || "GET";

  const url =
    typeof resource === "string"
      ? resource
      : resource instanceof URL
        ? resource.toString()
        : resource.url;

  const body = init?.body ? await new Response(init.body).text() : null;

  const requestHeaders: { [key: string]: string } = {};
  if (init?.headers) {
    const headers = new Headers(init.headers);
    headers.forEach((value, key) => {
      requestHeaders[key] = value;
    });
  }

  return {
    url,
    method,
    body,
    headers: requestHeaders,
  };
}

async function getResponseData(clonedResponse: Response) {
  const body: string | null =
    // @ts-ignore: weird type conflict between cloned response and `Response` type
    await tryGetResponseBodyAsText(clonedResponse);

  // @ts-ignore: weird type conflict between cloned response and `Response` type
  const headers = getResponseHeaders(clonedResponse);

  return {
    body,
    headers,
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
  };
}
