/**
 * Before you try to import Hono and use its types,
 * it's good to know that Hono's types are not compatible across
 * independently installed versions of Hono.
 */

/**
 * A simplified type representing a Hono application with a `routes` property
 */
export type HonoLikeApp = {
  routes: RouterRoute[];
};

type RouterRoute = {
  method: string;
  path: string;
  // We can't use the type of a handler that's exported by Hono.
  // When we do that, our types end up mismatching with the user's app!
  //
  // biome-ignore lint/complexity/noBannedTypes:
  handler: Function;
};
