import { AgentsSidebar } from "./AgentsSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full @container/main bg-popover">
      <div className="border flex-1 grid @xl/main:grid-cols-[300px_1fr] rounded-lg">
        <div className="border-r px-2 bg-background">
          <AgentsSidebar />
        </div>
        {children}
      </div>
    </div>
  );
}
