import { useQuery } from "@tanstack/react-query";

export const OPENAPI_CACHE_KEY = ["openapi-spec"];

export type OpenApiContext = {
  url?: string;
  content?: string;
};

export function openApiSpecQueryOptions(openapi: OpenApiContext | undefined) {
  return {
    queryKey: OPENAPI_CACHE_KEY,
    queryFn: async () => {
      if (openapi?.content) {
        return openapi.content;
      }

      if (!openapi?.url) {
        return undefined;
      }

      const response = await fetch(openapi.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.text();
    },
    enabled: !!openapi?.url || !!openapi?.content,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  };
}

export function useOpenApiSpec(openapi: OpenApiContext | undefined) {
  return useQuery(openApiSpecQueryOptions(openapi));
}
