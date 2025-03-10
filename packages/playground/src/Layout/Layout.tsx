import { useStudioStore } from "@/components/playground/store";
import { Button } from "@/components/ui/button";
import { useMountedPath } from "@/hooks/use-mounted-path";
import { createLink, useMatches } from "@tanstack/react-router";
import { type ReactNode, forwardRef } from "react";
import { cn } from "../utils";
import { BottomBar } from "./BottomBar";
import { SettingsScreen } from "./Settings";
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
  const { isWorkflowsEnabled, isTracingEnabled, shouldShowTopNav } =
    useStudioStore(
      "isWorkflowsEnabled",
      "isTracingEnabled",
      "shouldShowTopNav",
    );

  return (
    <div className="flex flex-col justify-between w-full min-h-screen overflow-hidden bg-muted/30 max-w-128">
      {shouldShowTopNav && (
        <div className="grid grid-cols-[1fr_auto] mt-1 px-4 items-center h-6 place-items-center">
          <div className="flex items-center gap-2">
            <NavButton to="/">Playground</NavButton>
            {isWorkflowsEnabled && (
              <NavButton to="/workflows">Workflows</NavButton>
            )}
            {isTracingEnabled && <NavButton to="/traces">Traces</NavButton>}
          </div>
          <UserMenu />
        </div>
      )}

      <main
        className={cn(
          "md:gap-8",
          "overflow-hidden",
          shouldShowTopNav ? "h-[calc(100vh-70px)]" : "h-[calc(100vh-40px)]",
        )}
      >
        {children}
      </main>
      <BottomBar />
      <SettingsScreen />
    </div>
  );
}

export default Layout;
