import { cn } from "@/utils";
import type { ReactNode } from "@tanstack/react-router";

export function ListSection({
  title,
  children,
  contentClassName,
}: {
  title: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="rounded-md border grid items-center bg-background">
      <div className="px-3 py-2.5 text-sm font-medium border-b h-12 grid items-center">{title}</div>
      <div className={cn("w-full py-2 px-3", contentClassName)}>{children}</div>
    </div>
  );
}
