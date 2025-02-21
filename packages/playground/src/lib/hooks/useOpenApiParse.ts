import { dereference } from "@apidevtools/swagger-parser";
import { useQuery } from "@tanstack/react-query";
import { type SupportedDocument, isOpenApiV2 } from "../isOpenApi";

export function useOpenApiParse(spec: string | undefined) {
  return useQuery({
    queryKey: ["parse-openapi", spec],
    queryFn: async (): Promise<SupportedDocument | null> => {
      if (!spec) {
        return null;
      }

      const parsed = JSON.parse(spec);
      const result = await dereference(parsed);
      if (isOpenApiV2(result)) {
        throw new Error("Unsupported OpenAPI document encountered");
      }

      return result;
    },
    enabled: !!spec,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
