import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavTabsTriggerProps {
  children: ReactNode;
  isActive: boolean;
  tabIndex: number;
  ariaSelected: boolean;
  role?: string;
}

function NavTabsTrigger({
  children,
  isActive,
  tabIndex,
  ariaSelected,
  role = "tab",
}: NavTabsTriggerProps) {
  return (
    <div
      role={role}
      aria-selected={ariaSelected}
      tabIndex={tabIndex}
      className={cn(
        "inline-flex items-center justify-center rounded-md whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 enabled:hover:bg-muted focus-visible:bg-transparent py-1 px-2 text-left text-sm font-normal",
        isActive
          ? "bg-muted text-foreground shadow"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </div>
  );
}

interface NavTabsProps {
  tabs: Array<{ title: ReactNode; key: string }>;
  tabId: string | undefined;
  renderTab: (args: {
    key: string;
    title: ReactNode;
    isActive: boolean;
  }) => ReactNode;
}

export function NavTabs({ tabs, tabId, renderTab }: NavTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-5 text-muted-foreground w-full justify-start rounded-none border-b gap-1 bg-transparent h-12",
      )}
      role="tablist"
    >
      {tabs.map(({ title, key }) => {
        const isActive = tabId === key;
        return (
          <NavTabsTrigger
            key={key}
            isActive={isActive}
            tabIndex={isActive ? 0 : -1}
            ariaSelected={isActive}
          >
            {renderTab({ key, title, isActive })}
          </NavTabsTrigger>
        );
      })}
    </div>
  );
}
