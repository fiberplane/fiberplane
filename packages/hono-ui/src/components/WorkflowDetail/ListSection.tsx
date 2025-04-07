import { cn } from "@/utils";
import type { ReactNode } from "@tanstack/react-router";

export function ListSection({
  title,
  children,
  className,
  contentClassName,
  titleClassName,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border grid items-start bg-background grid-rows-[auto_1fr]",
        className,
      )}
    >
      <div
        className={cn(
          "grid items-center",
          "px-3 py-2.5 min-h-12 border-b",
          "text-sm font-medium",
          titleClassName,
        )}
      >
        {title}
      </div>
      <div className={cn("py-2 px-3", contentClassName)}>{children}</div>
    </div>
  );
}
