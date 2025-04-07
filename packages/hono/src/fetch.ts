/**
 * We export a (frozen) web standard fetch function that can be used for internal fiberplane api requests.
 *
 * This is useful for the case where the user has also instrumented their app with the @fiberplane/hono-otel package.
 *
 * In this case, we don't want to use the instrumented fetch function for internal requests,
 * otherwise we'll end up with rogue spans for internal requests.
 */
export const webStandardFetch = fetch;
