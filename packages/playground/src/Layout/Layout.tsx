import { useStudioStore } from "@/components/playground/store";
import { Button } from "@/components/ui/button";
import { useHasFiberplaneServices } from "@/hooks";
import { useMountedPath } from "@/hooks/use-mounted-path";
import { createLink, useMatchRoute, useMatches } from "@tanstack/react-router";
import { type ReactNode, forwardRef } from "react";
import { cn } from "../utils";
import { BottomBar } from "./BottomBar";
import { SettingsScreen } from "./Settings";
import { FloatingSidePanel, SidePanelTrigger } from "./SidePanel";
import { UserMenu } from "./UserMenu";

const NavButtonComponent = forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, ...props }, ref) => {
  const matches = useMatches();
  const path = useMountedPath();
  const href = props.href?.startsWith(path)
    ? props.href.substring(path.length)
    : undefined;
  const isActive = matches.some((match) => match.routeId === href);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-6 hover:bg-input", isActive && "bg-input")}
      asChild
    >
      <a {...props} ref={ref} className={cn(className)} />
    </Button>
  );
});

NavButtonComponent.displayName = "NavButtonComponent";

const NavButton = createLink(NavButtonComponent);

export function Layout({ children }: { children?: ReactNode }) {
  const hasFiberplaneServices = useHasFiberplaneServices();

  const { isWorkflowsEnabled, isTracingEnabled } = useStudioStore(
    "isWorkflowsEnabled",
    "isTracingEnabled",
  );
  const matchRoute = useMatchRoute();
  const isTracesRoute = matchRoute({ to: "/traces", fuzzy: true });

  return (
    <div className="flex flex-col justify-between w-full min-h-screen overflow-hidden bg-muted/30 max-w-128">
      <div className="grid grid-cols-[auto_1fr_auto] mt-1 px-2 items-center h-6 place-items-center">
        <div className="flex items-center justify-start gap-2">
          {!isTracesRoute ? <SidePanelTrigger /> : <div className="sr-only" />}
          {!isTracesRoute && <FloatingSidePanel />}
        </div>
        <div className="flex items-center gap-2">
          <NavButton to="/">Playground</NavButton>
          {isWorkflowsEnabled && (
            <NavButton to="/workflows">Workflows</NavButton>
          )}
          {isTracingEnabled && <NavButton to="/traces">Traces</NavButton>}
        </div>
        {/**
         * Hide the user menu if the Fiberplane services integration is not enabled
         * (Integration is enabled when an api key is supplied)
         * This is because we cannot do auth without an api key
         *
         * IMPROVEMENT - Show a modal with link to documentation on how to sign up
         */}

        {hasFiberplaneServices ? <UserMenu /> : <div className="w-6 hidden" />}
      </div>

      <main
        className={cn("md:gap-8", "overflow-hidden", "h-[calc(100vh-70px)]")}
      >
        {children}
      </main>
      <BottomBar />
      <SettingsScreen />
    </div>
  );
}

export default Layout;
