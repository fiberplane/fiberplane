import { AgentsSidebar } from "./AgentsSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full @container/main bg-popover">
      <div className="flex-1 grid @xl/main:grid-cols-[300px_1fr]">
        <div className="border-r px-2 bg-popover">
          <AgentsSidebar />
        </div>
        {children}
      </div>
    </div>
  );
}
