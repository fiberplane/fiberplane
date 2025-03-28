import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHasOtelCollector } from "@/hooks";
import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { PlaygroundActiveResponse } from "../store/types";

export function CopyTraceIdButton({
  activeResponse,
}: {
  activeResponse: PlaygroundActiveResponse | undefined;
}) {
  const navigate = useNavigate();
  const hasOtelCollector = useHasOtelCollector();
  const [copied, setCopied] = useState(false);

  if (!activeResponse) {
    return null;
  }

  if (!hasOtelCollector) {
    return null;
  }

  // TODO: Replace with actual trace ID extraction
  const traceId = activeResponse.traceId ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(traceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // NOTE - The tracing details page needs some love before we link out to it
  const viewTrace = () => {
    navigate({
      to: "/UNRELEASEDtraces/$traceId",
      params: {
        traceId,
      },
    });
  };

  const isTraceDetailsPageImplemented = false;

  return (
    <div className="flex items-center min-h-7 bg-secondary/40 border-secondary/20 border rounded-lg mb-4 group transition-all hover:bg-secondary/50">
      <div className="flex items-center gap-2 px-1 pt-1 pb-1.5 w-full">
        <div className="rounded-full bg-secondary/20 p-1.5 group-hover:bg-secondary/30 transition-colors">
          <Icon
            icon="lucide:fingerprint"
            className="w-3.5 h-3.5 text-secondary-foreground"
          />
        </div>
        <span className="text-xs truncate max-w-[160px] font-medium text-secondary-foreground/90 font-mono">
          Trace Generated
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="ml-auto hover:bg-secondary h-7 w-7"
              >
                {copied ? (
                  <Icon icon="lucide:check" className="w-4 h-4" />
                ) : (
                  <Icon icon="lucide:copy" className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-secondary px-2 py-1.5 flex gap-1.5"
              align="center"
              side="left"
              sideOffset={16}
            >
              <div className="flex gap-0.5 text-xs">
                {copied ? "Copied!" : "Copy Trace Id"}
              </div>
            </TooltipContent>
          </Tooltip>
          {isTraceDetailsPageImplemented && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={viewTrace}
                  className="ml-auto hover:bg-secondary h-7 w-7"
                >
                  <Icon icon="lucide:eye" className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="bg-secondary px-2 py-1.5 flex gap-1.5"
                align="center"
                side="bottom"
                sideOffset={16}
              >
                <div className="flex gap-0.5 text-xs">Open Trace Details</div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
