import { useStudioStore } from "@/components/playground/store";
import { Button } from "@/components/ui/button";
import {
  FpDropdownMenu,
  FpDropdownMenuContent,
  FpDropdownMenuItem,
  FpDropdownMenuSeparator,
  FpDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";
import { useMountedPath } from "@/hooks/use-mounted-path";
import { getFpApiBasePath } from "@/lib/api/fetch";
import type { UserProfile } from "@/lib/auth";
import { useLoginHandler } from "@/lib/hooks/useLogin";
import { createLink, useMatches } from "@tanstack/react-router";
import { LogOut, UserCircle } from "lucide-react";
import { type ReactNode, forwardRef } from "react";
import { cn } from "../utils";
import { BottomBar } from "./BottomBar";
import { SettingsScreen } from "./Settings";

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

function UserAvatar({
  user,
  className,
}: {
  user: UserProfile | null;
  className?: string;
}) {
  if (!user) {
    return <UserCircle className="w-4 h-4" />;
  }

  return (
    <img
      src={`https://avatars.githubusercontent.com/u/${user.githubUserId}`}
      alt={user.email}
      className={cn("w-4 h-4 rounded-full", className)}
    />
  );
}

function UserMenu() {
  const user = useAuth();
  const login = useLoginHandler();

  return (
    <FpDropdownMenu>
      <FpDropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
          <UserAvatar user={user} />
        </Button>
      </FpDropdownMenuTrigger>
      <FpDropdownMenuContent align="end" className="w-48">
        {user && (
          <>
            <div className="px-2 py-1.5 text-sm font-medium flex items-center gap-2">
              <UserAvatar user={user} className="w-6 h-6" />
              {user.email}
            </div>
            <FpDropdownMenuSeparator />
          </>
        )}
        {user ? (
          <FpDropdownMenuItem
            onClick={() => {
              // TODO: Implement logout
              document.location = `${getFpApiBasePath()}/api/auth/logout`;
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </FpDropdownMenuItem>
        ) : (
          <FpDropdownMenuItem onClick={login}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log in</span>
          </FpDropdownMenuItem>
        )}
      </FpDropdownMenuContent>
    </FpDropdownMenu>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  const { isWorkflowsEnabled, isTracingEnabled, shouldShowTopNav } =
    useStudioStore(
      "isWorkflowsEnabled",
      "isTracingEnabled",
      "shouldShowTopNav",
    );

  const user = useAuth();

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
          <div className={cn({ hidden: !user })}>
            <UserMenu />
          </div>
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
