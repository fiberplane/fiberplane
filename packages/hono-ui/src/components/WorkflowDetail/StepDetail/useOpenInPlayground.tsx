import {
  type KeyValueElement,
  useStudioStore,
} from "@/components/playground/store";
import type { ExecutionError } from "@/lib/api/errors";
import {
  type SupportedParameterObject,
  isSupportedParameterObject,
} from "@/lib/isOpenApi";
import { useHandler } from "../../../hooks/useHandler";
import { useNavigate } from "@tanstack/react-router";

export function useOpenInPlayground(props: {
  operation: {
    method: string;
    path: string;
  };
  error?: ExecutionError;
}) {
  const navigate = useNavigate();
  const { operation, error } = props;
  const parameters = error?.payload.parameters;

  const {
    appRoutes,
    setActiveRoute,
    setCurrentPathParams,
    setCurrentRequestHeaders,
    setCurrentBody,
    setCurrentQueryParams,
    setActiveResponse,
  } = useStudioStore(
    "appRoutes",
    "setActiveRoute",
    "setCurrentPathParams",
    "setCurrentRequestHeaders",
    "setCurrentBody",
    "setCurrentQueryParams",
    "setActiveResponse",
  );

  const openInPlayground = useHandler(() => {
    const request = error?.payload.request;
    const response = error?.payload.response;

    if (request || response) {
      const route = appRoutes.find(
        (r) =>
          r.method.toLowerCase() === operation.method.toLowerCase() &&
          r.path === operation.path,
      );
      if (route) {
        setActiveRoute(route);

        if (request) {
          if (request.body) {
            setCurrentBody({
              type: "json",
              value: request.body,
            });
          }
          const headers = request.headers;
          const headerValues: Array<KeyValueElement> = Object.entries(
            headers,
          ).map(
            ([key, value]): KeyValueElement => ({
              key,
              id: key,
              data: {
                value,
                type: "string",
              },
              enabled: true,
              parameter: {
                in: "header",
                name: key,
              },
            }),
          );
          setCurrentRequestHeaders(headerValues);

          const routeParameters: Array<SupportedParameterObject> =
            route.parameters ?? [];
          const operationParameters: Array<SupportedParameterObject> =
            (route.operation.parameters?.filter(isSupportedParameterObject) as
              | undefined
              | Array<SupportedParameterObject>) ?? [];
          const combinedParameters = [
            ...routeParameters,
            ...operationParameters,
          ];

          const pathParams: Array<KeyValueElement> = combinedParameters
            .filter((p) => p.in === "path")
            .map((p) => ({
              key: p.name,
              data: {
                type: "string",
                value: String(parameters?.[p.name] || ""),
              },
              enabled: true,
              id: p.name,
              parameter: p,
            }));
          setCurrentPathParams(pathParams);
          const searchParams = combinedParameters
            .filter((p) => p.in === "query")
            .map(
              (p): KeyValueElement => ({
                id: p.name,
                key: p.name,
                enabled: true,
                data: {
                  type: "string",
                  value: String(parameters?.[p.name] || ""),
                },
                parameter: p,
              }),
            );
          setCurrentQueryParams(searchParams);
        }
        if (response) {
          setActiveResponse({
            isFailure: false,
            responseStatusCode: response.status.toString(),
            requestMethod: operation.method,
            requestUrl: request?.url || operation.path,
            responseBody: {
              type: "json",
              value: response.body || "",
              contentType: response.headers["content-type"] || "",
            },
            responseHeaders: response.headers,
            traceId: null,
          });
        }
      }
    }
    navigate({
      to: "/",
      search: (params) => ({
        ...params,
        method: operation.method.toUpperCase(),
        uri: operation.path,
      }),
    });
  });

  return openInPlayground;
}
