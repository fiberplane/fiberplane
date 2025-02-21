import { NavigationPanel } from "@/components/playground/NavigationPanel";
import { NavigationFrame } from "@/components/playground/NavigationPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsLgScreen } from "@/hooks";
import type { Trace } from "@/types";
import {
  getRequestMethod,
  getRequestUrl,
  isIncomingRequestSpan,
} from "@/utils/otel-helpers";
import { useMemo, useState } from "react";
import { TraceElement } from "./TraceElement";
export function TracesList(props: {
  traces: Trace[];
  openapi?: { url?: string };
}) {
  const { traces, openapi } = props;

  // HACK - This is a temporary hack to filter out:
  //
  //        1. Traces that don't have an incoming request span,
  //        2. Traces that don't have HTTP info like the request method and URL,
  //        3. Traces that are browser preflight OPTIONS requests to the remote openapi spec.
  //
  const filteredTraces = useMemo(() => {
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
      <div className="h-full p-4 overflow-y-auto">
        <h2 className="mb-4 text-lg font-medium">Traces (WIP)</h2>
        <div className="grid gap-2">
          {filteredTraces.map((trace: Trace) => {
            return <TraceElement key={trace.traceId} trace={trace} />;
          })}
        </div>
      </div>
    </TraceListLayout>
  );
}

function getMainSectionWidth() {
  return window.innerWidth - 85;
}

function TraceListLayout({ children }: { children: React.ReactNode }) {
  const [sidePanel] = useState<"open" | "closed">("open");
  const isLgScreen = useIsLgScreen();
  const width = getMainSectionWidth();

  // Panel constraints for responsive layout
  const minSize = (320 / width) * 100;
  return (
    <ResizablePanelGroup direction="horizontal" className="w-full">
      {isLgScreen && sidePanel === "open" && (
        <>
          <ResizablePanel
            id="sidebar"
            order={0}
            minSize={minSize}
            defaultSize={(320 / width) * 100}
          >
            <NavigationFrame>
              <NavigationPanel />
            </NavigationFrame>
          </ResizablePanel>
          <ResizableHandle
            hitAreaMargins={{ coarse: 20, fine: 10 }}
            className="w-0 mr-2"
          />
        </>
      )}
      <ResizablePanel id="main" order={1}>
        <div className="grid grid-cols-1 h-full min-h-0 overflow-hidden overflow-y-auto relative">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function getPathFromUrl(url: string) {
  try {
    return new URL(url).pathname;
  } catch (error) {
    return null;
  }
}
