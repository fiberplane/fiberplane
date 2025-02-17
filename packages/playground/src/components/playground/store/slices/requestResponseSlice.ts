import {
  type SupportedMediaTypeObject,
  type SupportedParameterObject,
  type SupportedReferenceObject,
  type SupportedRequestBodyObject,
  isSupportedOperationObject,
  isSupportedParameterObject,
  isSupportedRequestBodyObject,
} from "@/lib/isOpenApi";
import type { StateCreator } from "zustand";
import {
  enforceTerminalDraftParameter,
  reduceKeyValueElements,
} from "../../KeyValueForm";
import { createKeyValueElement } from "../../KeyValueForm/data";
import type { ApiRoute } from "../../types";
import { updateContentTypeHeaderInState } from "../content-type";
import { setBodyTypeInState } from "../set-body-type";
import type { KeyValueElement, PlaygroundBody } from "../types";
import {
  addBaseUrl,
  extractPathParameterKeys,
  removeBaseUrl,
  resolvePathWithParameters,
} from "../utils";
import {
  generateFakeData,
  transformToFormBody,
  transformToFormParams,
} from "../utils-faker";
import {
  extractFormDataFromOpenApiDefinition,
  extractJsonBodyFromOpenApiDefinition,
  extractQueryParamsFromOpenApiDefinition,
} from "../utils-openapi";
import type { ApiCallData, RequestResponseSlice, StudioState } from "./types";

export const requestResponseSlice: StateCreator<
  StudioState,
  [["zustand/devtools", never]],
  [],
  RequestResponseSlice
> = (set, get) => ({
  serviceBaseUrl: "http://localhost:8787",
  apiCallState: {
    // This is needed to avoid the case where there are no routes yet loaded
    // and so path/method is still set to the default value
    // the key should be whatever the `getRouteId` function would generate based on the state
    GET_: createInitialApiCallData(),
  },

  // HACK - This setter has a bunch of side effects (logs, alerts)
  //        I moved it to the store so that it'd be a static handler.
  fillInFakeData: () => {
    const state = get();
    const { activeRoute } = state;
    if (!activeRoute) {
      console.error("No active route set");
      window.alert("No active route set");
      return;
    }

    try {
      const fakeData = generateFakeData(
        activeRoute.operation,
        activeRoute.path,
      );

      // Transform data to match form state types
      set((initialState: StudioState): StudioState => {
        const state = { ...initialState };
        if (!state.activeRoute) {
          console.warn("Can't fill in fake data, there is no active route");
          return state;
        }
        const id = getRouteId(state.activeRoute);
        state.apiCallState = {
          ...state.apiCallState,
        };
        const { apiCallState } = state;

        if (id in apiCallState === false) {
          apiCallState[id] = createInitialApiCallData(state.activeRoute);
        } else {
          apiCallState[id] = { ...apiCallState[id] };
        }

        const params = apiCallState[id];
        params.body = transformToFormBody(fakeData.body);

        const fakeQueryParams = transformToFormParams(fakeData.queryParams);
        if (fakeQueryParams.length > 0) {
          params.queryParams = enforceTerminalDraftParameter(
            transformToFormParams(fakeData.queryParams),
          );
        }

        const fakeHeaders = transformToFormParams(fakeData.headers);
        if (fakeHeaders.length > 0) {
          params.requestHeaders = enforceTerminalDraftParameter(fakeHeaders);
        }

        const fakePathParams = transformToFormParams(fakeData.pathParams).map(
          (param) => ({
            ...param,
            id: param.key,
          }),
        );

        if (fakePathParams.length > 0) {
          params.pathParams = fakePathParams;
        }
        return initialState;
      });
    } catch (e) {
      console.error("Error parsing OpenAPI spec:", e);
      window.alert("Error parsing OpenAPI spec");
    }
  },

  setCurrentAuthorizationId: (authorizationId: string | null) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("Can't set current authorization id, no active route");
        return initialState;
      }

      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;

      const id = getRouteId(state.activeRoute || state);
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];
      params.authorizationId = authorizationId;
      return state;
    }),

  setServiceBaseUrl: (serviceBaseUrl) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (state.serviceBaseUrl === serviceBaseUrl) {
        return initialState;
      }
      state.serviceBaseUrl = serviceBaseUrl;

      if (!state.activeRoute) {
        return state;
      }

      // The path might be changed, so verify that there's a default
      // `apiCallState` value
      const id = getRouteId(state.activeRoute);
      if (id in state.apiCallState === false) {
        state.apiCallState = {
          ...state.apiCallState,
        };
        state.apiCallState[id] = createInitialApiCallData(state.activeRoute);
      }

      return state;
    }),

  setCurrentPathParams: (pathParams) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("Unable to set current path parameters: no active route");
        return initialState;
      }

      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;
      const id = getRouteId(state.activeRoute);
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];
      params.pathParams = pathParams;
      return state;
    }),

  updateCurrentPathParamValues: (pathParams) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("Unable to update current path parameter values");
        return initialState;
      }

      const id = getRouteId(state.activeRoute || state);
      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];

      params.pathParams = params.pathParams.map(
        (pathParam: KeyValueElement) => {
          const replacement = pathParams?.find((p) => p?.key === pathParam.key);
          if (!replacement) {
            return pathParam;
          }

          return {
            ...pathParam,
            value: replacement.value,
            enabled: !!replacement.value,
          };
        },
      );

      return state;
    }),

  clearCurrentPathParams: () =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("No active route (clearCurrentPathParams)");
        return initialState;
      }

      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;
      const id = getRouteId(state.activeRoute);
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];
      params.pathParams = params.pathParams.map((pathParam) => ({
        ...pathParam,
        value: "",
        enabled: false,
      }));

      return state;
    }),

  setCurrentQueryParams: (queryParams) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("No active route (setCurrentQueryParams)");
        return initialState;
      }

      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;
      const id = getRouteId(state.activeRoute);
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];
      params.queryParams = enforceTerminalDraftParameter(queryParams);
      return state;
    }),

  setCurrentRequestHeaders: (headers) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("No active route (setCurrentRequestHeaders)");
        return initialState;
      }
      const { apiCallState } = state;
      const id = getRouteId(state.activeRoute);
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      }

      const params = apiCallState[id];
      params.requestHeaders = enforceTerminalDraftParameter(headers);
      return state;
    }),

  setCurrentBody: (body) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      if (!state.activeRoute) {
        console.warn("No active route (setCurrentBody)");
        return initialState;
      }

      const id = getRouteId(state.activeRoute);
      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;

      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(state.activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const params = apiCallState[id];
      if (body === undefined) {
        params.body =
          params.body.type === "form-data"
            ? {
                type: "form-data",
                value: enforceTerminalDraftParameter([]),
                isMultipart: params.body.isMultipart,
              }
            : params.body.type === "file"
              ? { type: params.body.type, value: undefined }
              : { type: params.body.type, value: "" };
      } else if (typeof body === "string") {
        params.body = { type: "text", value: body };
      } else {
        if (body.type === "form-data") {
          const nextBodyValue = enforceTerminalDraftParameter(body.value);
          const shouldForceMultipart = nextBodyValue.some(
            (param) => param.data.value instanceof File,
          );
          params.body = {
            type: body.type,
            isMultipart: shouldForceMultipart || body.isMultipart,
            value: nextBodyValue,
          };
          updateContentTypeHeaderInState(state);
        } else if (body.type === "file") {
          // When the user adds a file, we want to use the file's type as the content type header
          params.body = body;
          updateContentTypeHeaderInState(state);
        } else {
          params.body = body;
        }
      }
      return state;
    }),

  handleRequestBodyTypeChange: (requestBodyType, isMultipart) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      setBodyTypeInState(state, { type: requestBodyType, isMultipart });
      updateContentTypeHeaderInState(state);
      return state;
    }),

  // TODO - change the function ref when the serviceBaseUrl is updated
  removeServiceUrlFromPath: (path: string) =>
    removeBaseUrl(get().serviceBaseUrl, path),

  setActiveResponse: (response) =>
    set((initialState: StudioState): StudioState => {
      const state = { ...initialState };
      const { activeRoute } = state;
      if (!activeRoute) {
        throw new Error("Unable to set active response: no active route");
        // return;
      }

      const id = getRouteId(activeRoute);

      state.apiCallState = {
        ...state.apiCallState,
      };
      const { apiCallState } = state;
      if (id in apiCallState === false) {
        apiCallState[id] = createInitialApiCallData(activeRoute);
      } else {
        apiCallState[id] = { ...apiCallState[id] };
      }

      const apiData = apiCallState[id];
      apiData.activeResponse = response;
      return state;
    }),
});

export function createInitialApiCallData(route?: ApiRoute): ApiCallData {
  const data = createEmptyApiCallData();
  if (!route) {
    return data;
  }

  const params = [
    ...(route.parameters ?? []),
    ...(route.operation.parameters || []),
  ];
  data.pathParams = extractPathParameterKeys(route.path).map((key: string) => {
    const parameter = params.find(
      (item) =>
        isSupportedParameterObject(item) &&
        item.name === key &&
        item.in === "path",
    ) as SupportedParameterObject | undefined;
    return createKeyValueElement(key, undefined, parameter);
  });

  data.queryParams = extractQueryParamsFromOpenApiDefinition(
    data.queryParams,
    route,
  );

  // Does the route support a body parameter?
  if (
    route.method !== "GET" &&
    route.method !== "HEAD" &&
    isSupportedOperationObject(route)
  ) {
    data.body = extractBodyFromOpenApiDefinition(
      data.body,
      route.operation.requestBody,
      "application/json",
    );
  }
  return data;
}

const supportedBodyTypes = ["application/json", "multipart/form-data"] as const;
type SupportedBodyContentType = (typeof supportedBodyTypes)[number];

function extractBodyFromOpenApiDefinition(
  currentBody: PlaygroundBody,
  bodyObject: SupportedRequestBodyObject | SupportedReferenceObject | undefined,
  preferredContentType: SupportedBodyContentType = "application/json",
): PlaygroundBody {
  if (bodyObject === undefined || !isSupportedRequestBodyObject(bodyObject)) {
    return currentBody;
  }

  type ContentMap = {
    contentType: SupportedBodyContentType;
    mediaType: SupportedMediaTypeObject;
  };
  const contentTypes = Object.entries(bodyObject.content)
    .filter(([contentType]) =>
      supportedBodyTypes.includes(contentType as SupportedBodyContentType),
    )
    .map(
      ([contentType, mediaTypeObject]): ContentMap => ({
        contentType: contentType as SupportedBodyContentType,
        mediaType: mediaTypeObject as SupportedMediaTypeObject,
      }),
    );

  const extract = ({ contentType, mediaType }: ContentMap): PlaygroundBody => {
    switch (contentType) {
      case "application/json": {
        return extractJsonBodyFromOpenApiDefinition(currentBody, mediaType);
      }

      case "multipart/form-data": {
        return extractFormDataFromOpenApiDefinition(mediaType);
      }

      default: {
        // This will cause a type error if we haven't handled all possible content types
        const _exhaustiveCheck: never = contentType;
        throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
      }
    }
  };

  const content =
    contentTypes.find((item) => item.contentType === preferredContentType) ||
    contentTypes[0];
  return content ? extract(content) : currentBody;
}

export function createEmptyApiCallData(): ApiCallData {
  return {
    authorizationId: null,
    body: {
      type: "json",
      value: "",
    },
    pathParams: [],
    queryParams: enforceTerminalDraftParameter([]),
    requestHeaders: enforceTerminalDraftParameter([]),
    activeResponse: null,
  };
}

export function getRouteId({
  method,
  path,
}: Pick<ApiRoute, "method" | "path">): string {
  return `${method.toUpperCase()}_${path}`;
}

export function constructFullPath(
  serviceBaseUrl: string,
  route: ApiRoute,
  data: ApiCallData,
): string {
  let fullPath = addBaseUrl(serviceBaseUrl, route.path);
  fullPath = resolvePathWithParameters(
    fullPath,
    data.pathParams.filter((param) => param.enabled),
  );

  const searchParams = new URLSearchParams(
    reduceKeyValueElements(data.queryParams, {
      stringValuesOnly: true,
    }),
  );

  return searchParams.size > 0
    ? `${fullPath}?${searchParams.toString()}`
    : fullPath;
}
