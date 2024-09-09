import { Icon } from "@iconify/react";
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
  Root,
} from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { NavigationPanel } from "../pages/RequestorPage/NavigationPanel";
import { useRequestorStore } from "../pages/RequestorPage/store";
import { cn } from "../utils";

export function SidePanel() {
  const { sidePanelOpen, setSidePanelOpen, path } = useRequestorStore(
    "sidePanelOpen",
    "setSidePanelOpen",
    "path",
  );

  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Close side panel on path/route selection changes
  useEffect(() => {
    return () => setSidePanelOpen(false);
  }, [pathname, path, setSidePanelOpen]);

  return (
    <Root open={sidePanelOpen} onOpenChange={setSidePanelOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-0.5 w-6 h-6 lg:hidden"
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
        >
          <Icon icon="lucide:menu" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed top-0 left-0 w-full h-full bg-black/40" />
        <DialogContent
          className={cn(
            "fixed left-0 top-0 z-50 grid w-[400px]",
            "gap-4 border bg-background shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2",
            // "data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2",
            // "data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg",
            "h-full",
            "z-50",
          )}
        >
          <NavigationPanel />
        </DialogContent>
      </DialogPortal>
    </Root>
  );
}
