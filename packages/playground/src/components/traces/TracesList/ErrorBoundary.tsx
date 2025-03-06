import { TextOrJsonViewer } from "@/components/ResponseBody";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  //  getFpApiErrorDetailsJson,
  isFpApiError,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseEmbeddedConfig } from "@/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMemo, useState } from "react";

export function TracesListErrorBoundary(props: {
  error: Error;
}) {
  const { error } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { mountedPath, openapi, parseError } = useDebugInfo();

  // TODO - Make more friendly errors
  const message = error.message;

  // HACK - This is the error that happens when the middleware makes a request against a collector that is not running
  // IMPROVEMENT - This is also the error that happens when the auth is invalid
  // TODO - Improve the middleware to propagate the status code correctly
  //        * 500 for "failed to fetch"
  //        * 401 for "invalid auth"
  let help: null | string = null;
  if (isFpApiError(error)) {
    // const details = getFpApiErrorDetailsJson(error);
    // if (details?.error === "Failed to fetch traces") {
    help =
      "Check that your OpenTelemetry collector is running, and that your auth token is valid.";
    // }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="mb-2 text-lg font-medium">Error loading traces</h2>
      <p className="text-sm text-muted-foreground">{help ?? message}</p>
      {process.env.NODE_ENV !== "production" && (
        <div className="flex flex-col gap-4 mt-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <span className="text-muted-foreground">Debug Info</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="grid gap-2">
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      MOUNTED_PATH
                    </p>
                    <code className="text-sm">{mountedPath}</code>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      OPENAPI
                    </p>
                    <TextOrJsonViewer text={JSON.stringify(openapi, null, 2)} />
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      PARSE_ERROR
                    </p>
                    <code className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(parseError, null, 2)}
                    </code>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      LOADER_ERROR
                    </p>
                    <code className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(error, null, 2)}
                    </code>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

type DebugInfo = {
  mountedPath: string | undefined | null;
  openapi: Record<string, unknown> | undefined | null;
  parseError: Error | null | unknown;
};

function useDebugInfo(): DebugInfo {
  return useMemo(() => {
    try {
      const rootElement = document.getElementById("root");
      if (!rootElement) {
        return {
          mountedPath: null,
          openapi: null,
          parseError: { message: "Root element not found" },
        };
      }
      return {
        ...parseEmbeddedConfig(rootElement),
        parseError: null,
      };
    } catch (parseError) {
      return {
        mountedPath: null,
        openapi: null,
        parseError,
      };
    }
  }, []);
}
