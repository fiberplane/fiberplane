import { type FpResolvedConfig, getShouldTraceEverything } from "../../config";

export function cloneRequestForAttributes(
  request: Request,
  resolvedConfig: FpResolvedConfig,
) {
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);

  if (!shouldTraceEverything) {
    return { requestForAttributes: request, newRequest: request };
  }

  // HACK - Duplicate request to be able to read the body and other metadata
  //        in the middleware without messing up the original request
  const clonedRequest = shouldTraceEverything ? request.clone() : request;
  const [body1, body2] = clonedRequest.body
    ? clonedRequest.body.tee()
    : [null, null];

  // In order to keep `onStart` synchronous (below), we construct
  // some necessary attributes here, using a cloned request
  const requestForAttributes = new Request(clonedRequest.url, {
    method: request.method,
    headers: new Headers(request.headers),
    body: body1,

    // NOTE - This is a workaround to support node environments
    //        Which will throw errors when body is a stream but duplex is not set
    //        https://github.com/nodejs/node/issues/46221
    // @ts-expect-error - duplex is available in nodejs-compat but cloudflare types
    // don't seem to pick it up
    duplex: body1 ? "half" : undefined,
  });

  // Replace the original request's body with the second stream
  const newRequest = shouldTraceEverything
    ? new Request(clonedRequest, {
        body: body2,
        headers: new Headers(request.headers),
        method: request.method,
        // NOTE - This is a workaround to support node environments
        //        Which will throw errors when body is a stream but duplex is not set
        //        https://github.com/nodejs/node/issues/46221
        // @ts-expect-error - duplex is available in nodejs-compat but cloudflare types
        // don't seem to pick it up
        duplex: body2 ? "half" : undefined,
      })
    : request;

  return {
    requestForAttributes,
    newRequest,
  };
}
