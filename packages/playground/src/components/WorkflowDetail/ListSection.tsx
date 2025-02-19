import type { ReactNode } from "@tanstack/react-router";

export function ListSection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="py-1.5 pb-2 rounded-lg bg-muted">
      <div className="grid items-center mx-2">
        <div className="p-1.5 pt-0.5 text-sm font-medium">{title}</div>
        <div className="w-full p-2 rounded-md bg-background">{children}</div>
      </div>
    </div>
  );
}
