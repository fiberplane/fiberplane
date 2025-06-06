import { cn, getHttpMethodString, getHttpMethodTextColor } from "@/lib/utils";

export function Method({
  method,
  className,
}: { method: string; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono",
        getHttpMethodTextColor(method?.toUpperCase?.()),
        className,
      )}
    >
      {getHttpMethodString(method)}
    </span>
  );
}
