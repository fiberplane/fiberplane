import { useCopyToClipboard } from "@/hooks";
import { useMountedPath } from "@/hooks/use-mounted-path";
import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";

interface CopyableUrlProps {
  workflowId: string;
}

export function WorkflowUrl({ workflowId }: CopyableUrlProps) {
  const mountedPath = useMountedPath();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const workflowUrl = `${window.location.origin}${mountedPath}/w/${workflowId}`;

  return (
    <div className="mt-3 py-1.5 pb-2 rounded-lg bg-muted">
      <div className="mx-2">
        <div className="p-1.5 pt-0.5 text-sm font-medium">
          Run this workflow by making a POST request to
        </div>
        <div className="flex items-center gap-2 overflow-x-auto text-sm">
          <code className="text-accent truncate max-w-[400px] p-2 rounded-md bg-background">
            {workflowUrl}
          </code>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => copyToClipboard(workflowUrl)}
            className="w-auto h-auto p-1 rounded-sm text-foreground hover:text-foreground"
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
