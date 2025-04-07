import { CodeMirrorJsonEditor } from "@/components/CodeMirror";
import { Button } from "@/components/ui/button";
import { cn, noop } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

// Component to display JSON in a collapsible format
export const ExpandableJSONViewer = ({
  data,
  label = "Raw Data",
  className,
}: { data: unknown; label?: string; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("font-mono text-sm mt-2", className)}>
      <Button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="icon-xs"
        className="w-auto pr-2 pl-1 text-xs gap-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>

      {isExpanded && <JSONViewer data={data} className="mt-2" />}
    </div>
  );
};
export const JSONViewer = ({
  data,
  className,
}: { data: unknown; label?: string; className?: string }) => {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }, [data]);

  return (
    <div className={cn("font-mono text-xs pl-2 border rounded-lg", className)}>
      <CodeMirrorJsonEditor
        onChange={noop}
        readOnly
        value={jsonString}
        minHeight="auto"
      />
    </div>
  );
};
