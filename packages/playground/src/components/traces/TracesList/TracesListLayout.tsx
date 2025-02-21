import { NavigationPanel } from "@/components/playground/NavigationPanel";
import { NavigationFrame } from "@/components/playground/NavigationPanel";
import { useStudioStore } from "@/components/playground/store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsLgScreen } from "@/hooks";
import { cn } from "@/utils";
import { useState } from "react";

function getMainSectionWidth() {
  return window.innerWidth - 85;
}

export function TraceListLayout({ children }: { children: React.ReactNode }) {
  const [sidePanel] = useState<"open" | "closed">("open");
  const isLgScreen = useIsLgScreen();
  const width = getMainSectionWidth();

  const { shouldShowTopNav } = useStudioStore("shouldShowTopNav");

  // Panel constraints for responsive layout
  const minSize = (320 / width) * 100;

  return (
    <div
      className={cn(
        "p-2 min-h-full",
        "flex",
        "flex-col",
        "gap-2",
        shouldShowTopNav ? "h-[calc(100vh-70px)]" : "h-[calc(100vh-40px)]",
      )}
    >
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {isLgScreen && sidePanel === "open" && (
          <>
            <ResizablePanel
              id="sidebar"
              order={0}
              minSize={minSize}
              defaultSize={(320 / width) * 100}
            >
              <NavigationFrame>
                <NavigationPanel />
              </NavigationFrame>
            </ResizablePanel>
            <ResizableHandle
              hitAreaMargins={{ coarse: 20, fine: 10 }}
              className="w-0 mr-2"
            />
          </>
        )}
        <ResizablePanel id="main" order={1}>
          <div className="grid grid-cols-1 h-full min-h-0 overflow-hidden overflow-y-auto relative">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
