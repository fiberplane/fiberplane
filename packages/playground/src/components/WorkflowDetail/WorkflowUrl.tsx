import { useCopyToClipboard } from "@/hooks";
import { useMountedPath } from "@/hooks/use-mounted-path";
import { Check, Copy } from "lucide-react";
import { Method } from "../Method";
import { Button } from "../ui/button";

interface CopyableUrlProps {
  workflowId: string;
}

export function WorkflowUrl({ workflowId }: CopyableUrlProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const workflowUrl = useWorkflowUrl(workflowId);

  return (
    <div className="px-2 grid gap-2 pt-2 pb-4">
      <div className="text-sm font-medium px-2">
        Run this workflow by making a POST request to
      </div>
      <div className="flex items-center gap-2 overflow-x-auto text-sm px-4 bg-input rounded-lg">
        <Method method="POST" />
        <code className="truncate flex-1 p-2 rounded-md">{workflowUrl}</code>
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
  );
}

export function useWorkflowUrl(workflowId: string) {
  const mountedPath = useMountedPath();
  const workflowUrl = `${window.location.origin}${mountedPath}/w/${workflowId}`;
  return workflowUrl;
}
