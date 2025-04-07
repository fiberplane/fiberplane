import { cn } from "@/utils";

export function StepDetailBodyViewer({
  body,
  className,
}: { body: string; className?: string }) {
  return (
    <pre className={cn("max-w-full overflow-auto font-mono", className)}>
      <code>{body}</code>
    </pre>
  );
}
