import { Button } from "@/components/ui/button";
import type { Trace } from "@/types";
import { getPathFromUrl } from "@/utils";
import {
  getRequestMethod,
  getRequestUrl,
  isIncomingRequestSpan,
} from "@/utils/otel-helpers";
import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { TraceElement } from "./TraceElement";
import { TraceListLayout } from "./TracesListLayout";

export function TracesList(props: {
  traces: Trace[];
  reload: () => void;
  openapi?: { url?: string };
}) {
  const { traces, openapi } = props;

  const filteredTraces = useFilteredTraces(traces, openapi);

  if (!filteredTraces || filteredTraces?.length === 0) {
    return (
      <TraceListLayout>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <h2 className="mb-2 text-lg font-medium">No traces found</h2>
          <p className="text-sm text-muted-foreground">
            Make a request to get started
          </p>
        </div>
      </TraceListLayout>
    );
  }

  return (
    <TraceListLayout>
      <div className="h-full px-2 overflow-y-auto">
        <h2 className="mb-2 text-lg font-medium flex items-center">
          Traces
          <Button
            onClick={props.reload}
            className="ml-auto w-6 h-6"
            size="icon-xs"
            variant="ghost"
          >
            <Icon className="w-4 h-4" icon="lucide:refresh-cw" />
          </Button>
        </h2>
        <div className="grid gap-2">
          {filteredTraces.map((trace: Trace) => {
            return <TraceElement key={trace.traceId} trace={trace} />;
          })}
        </div>
      </div>
    </TraceListLayout>
  );
}

/**
 * Temporary hack to filter out:
 *
 * 1. Traces that don't have an incoming request span
 * 2. Traces that don't have HTTP info like the request method and URL
 * 3. Traces that are browser preflight OPTIONS requests to the remote openapi spec
 */
function useFilteredTraces(traces: Trace[], openapi?: { url?: string }) {
  return useMemo(() => {
    return traces?.filter((trace) => {
      const rootSpan = trace.spans.find((span) => isIncomingRequestSpan(span));
      const hasRootSpan = !!rootSpan;
      if (!hasRootSpan) {
        return false;
      }

      const requestUrl = getRequestUrl(rootSpan);
      const requestMethod = getRequestMethod(rootSpan);

      // Skip traces that don't have HTTP info
      if (!requestMethod || !requestUrl) {
        return false;
      }

      // So the UI gets polluted with browser preflight requests to the remote spec (e.g., `OPTIONS /openapi.json`).
      // This is a temporary workaround to skip those traces and make the UX of this page better.
      const didFetchSpecRemotely = !!openapi?.url;
      const isOptions = requestMethod?.toLowerCase() === "options";
      const requestPath = requestUrl ? getPathFromUrl(requestUrl) : "";
      const openapiPath = openapi?.url ? getPathFromUrl(openapi.url) : "";

      const isOptionsRequestToOpenApiSpec =
        didFetchSpecRemotely && isOptions && requestPath === openapiPath;

      if (isOptionsRequestToOpenApiSpec) {
        return false;
      }

      return true;
    });
  }, [traces, openapi]);
}
