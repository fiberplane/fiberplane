import type { StateCreator } from "zustand";
import { findAllSmartRouterMatches, findMatchedRoute } from "../../routes";
import type { ProbedRoute, RequestMethod } from "../../types";
import { updateContentTypeHeaderInState } from "../content-type";
import {
  getVisibleRequestPanelTabs,
  getVisibleResponsePanelTabs,
} from "../tabs";
import {
  addBaseUrl,
  extractMatchedPathParams,
  extractPathParams,
  mapPathParamKey,
  pathHasValidBaseUrl,
  removeBaseUrl,
} from "../utils";
import type { RoutesSlice, Store } from "./types";

export const routesSlice: StateCreator<
  Store,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  RoutesSlice
> = (set, get) => ({
  routes: [],
  selectedRoute: null,

  setRoutes: (routes) =>
    set((state) => {
      const matchedRoute = findMatchedRoute(
        routes,
        removeBaseUrl(state.serviceBaseUrl, state.path),
        state.method,
        state.requestType,
      );
      const nextSelectedRoute = matchedRoute ? matchedRoute.route : null;
      const nextPathParams = matchedRoute
        ? extractMatchedPathParams(matchedRoute)
        : extractPathParams(state.path).map(mapPathParamKey);

      state.routes = routes;
      state.selectedRoute = nextSelectedRoute;
      state.pathParams = nextPathParams;
    }),

  selectRoute: (route) =>
    set((state) => {
      const nextMethod = probedRouteToInputMethod(route);
      const nextRequestType = route.requestType;

      state.selectedRoute = route;
      state.path = addBaseUrl(state.serviceBaseUrl, route.path, {
        requestType: nextRequestType,
      });
      state.method = nextMethod;
      state.requestType = nextRequestType;
      state.pathParams = extractPathParams(route.path).map(mapPathParamKey);
      state.activeHistoryResponseTraceId = null;
      state.activeResponse = null;

      // Update tabs (you might want to move this logic to a separate slice)
      state.visibleRequestsPanelTabs = getVisibleRequestPanelTabs({
        requestType: nextRequestType,
        method: nextMethod,
      });
      state.activeRequestsPanelTab = state.visibleRequestsPanelTabs.includes(
        state.activeRequestsPanelTab,
      )
        ? state.activeRequestsPanelTab
        : state.visibleRequestsPanelTabs[0];

      state.visibleResponsePanelTabs = getVisibleResponsePanelTabs({
        requestType: nextRequestType,
      });
      state.activeResponsePanelTab = state.visibleResponsePanelTabs.includes(
        state.activeResponsePanelTab,
      )
        ? state.activeResponsePanelTab
        : state.visibleResponsePanelTabs[0];

      // Add content type header (you might want to move this to a separate function)
      updateContentTypeHeaderInState(state);
    }),

  routesAndMiddleware: [],
  setRoutesAndMiddleware: (routesAndMiddleware) =>
    set((state) => {
      state.routesAndMiddleware = routesAndMiddleware;
    }),

  getMatchingMiddleware: () => {
    const state = get();
    const {
      path,
      method,
      requestType,
      serviceBaseUrl,
      routes,
      routesAndMiddleware,
    } = state;

    const canMatchMiddleware =
      !pathHasValidBaseUrl(path) || path.startsWith(serviceBaseUrl);

    // NOTE - We can only match middleware for the service we're monitoring anyhow
    //        If someone is making a request to jsonplaceholder, we don't wanna
    //        match middleware that might fire for an internal goose api call
    if (!canMatchMiddleware) {
      return null;
    }

    const matchedRoute = findMatchedRoute(
      routes,
      removeBaseUrl(serviceBaseUrl, path),
      method,
      requestType,
    )?.route;

    if (!matchedRoute) {
      return null;
    }

    const indexOfMatchedRoute = matchedRoute
      ? routesAndMiddleware.indexOf(matchedRoute)
      : -1;

    // NOTE - `routesAndMiddleware` is already filtered for all registered handlers
    //        and sorted in descending order by registration order.
    //        (So the last element is the most recently registered)
    //        This is why we can just slice the array from the matched route
    //        index onwards and only check for matching middleware.
    const registeredHandlersBeforeRoute =
      indexOfMatchedRoute > -1
        ? routesAndMiddleware.slice(indexOfMatchedRoute)
        : [];

    const filteredMiddleware = registeredHandlersBeforeRoute.filter(
      (r) => r.handlerType === "middleware",
    );

    const middlewareMatches = findAllSmartRouterMatches(
      filteredMiddleware,
      removeBaseUrl(state.serviceBaseUrl, path),
      method,
      requestType,
    );

    const middleware = [];
    for (const m of middlewareMatches ?? []) {
      if (m?.route && m.route?.handlerType === "middleware") {
        middleware.push(m.route);
      }
    }
    return middleware;
  },
});

const SUPPORTED_METHODS: Array<RequestMethod> = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "PATCH",
  "HEAD",
];
// Helper functions
function probedRouteToInputMethod(route: ProbedRoute): RequestMethod {
  const method = route.method.toUpperCase() as RequestMethod;
  // Validate that the method is supported
  if (SUPPORTED_METHODS.includes(method)) {
    return method;
  }

  return "GET";
}
