import type { ReactNode } from "@tanstack/react-router";

export function ListSection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border grid items-center bg-background">
      <div className="px-3 py-2.5 text-sm font-medium border-b">{title}</div>
      <div className="w-full py-2 px-3">{children}</div>
    </div>
  );
}
