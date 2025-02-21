import { NavigationPanel } from "@/components/playground/NavigationPanel";
import { NavigationFrame } from "@/components/playground/NavigationPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsLgScreen } from "@/hooks";
import { useState } from "react";

function getMainSectionWidth() {
  return window.innerWidth - 85;
}

export function TraceListLayout({ children }: { children: React.ReactNode }) {
  const [sidePanel] = useState<"open" | "closed">("open");
  const isLgScreen = useIsLgScreen();
  const width = getMainSectionWidth();

  // Panel constraints for responsive layout
  const minSize = (320 / width) * 100;
  return (
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
  );
}
