import { GitHubLogoIcon } from "@radix-ui/react-icons";
import type React from "react";
import { ComponentProps } from "react";
import { NavLink } from "react-router-dom";
import FpxIcon from "./assets/fpx.svg";
import { WebhoncBadge } from "./components/WebhoncBadge";
import { Button } from "./components/ui/button";
import { useWebsocketQueryInvalidation } from "./hooks";
import { useProxyRequestsEnabled } from "./hooks/useProxyRequestsEnabled";
import { cn } from "./utils";

const Branding = () => {
  return (
    <div>
      <FpxIcon height="32px" width="32px" />
    </div>
  );
};

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // Will add new fpx-requests as they come in by refetching
  // In the future, we'll want to build a better ux around this (not auto refresh the table)
  //
  // This should be used only at the top level of the app to avoid unnecessary re-renders
  useWebsocketQueryInvalidation();

  const shouldShowProxyRequests = useProxyRequestsEnabled();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30 max-w-128 overflow-hidden">
      <nav className="flex gap-4 sm:gap-4 py-4 sm:py-0 justify-between items-center h-[64px] border-b">
        <div className="sticky top-0 flex items-center gap-2 px-4 sm:static sm:h-auto border-0 bg-transparent md:px-6 py-2 text-sm">
          <Branding />
          <div className="ml-2">
            <div className="flex items-center gap-2 text-sm">
              <HeaderNavLink to="/requestor">Routes</HeaderNavLink>
              <HeaderNavLink to="/requests">Requests</HeaderNavLink>
              <HeaderNavLink to="/settings">Settings</HeaderNavLink>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {shouldShowProxyRequests && (
            <div className="ml-2">
              <WebhoncBadge />
            </div>
          )}
          <div className="flex items-center gap-2 border-l">
            <Button variant="ghost" size="icon">
              <a
                href="https://github.com/fiberplane/fpx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubLogoIcon className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </nav>
      <main
        className={cn("md:gap-8", "overflow-hidden", "h-[calc(100vh-64px)]")}
      >
        {children}
      </main>
    </div>
  );
};

const HeaderNavLink = (props: ComponentProps<typeof NavLink>) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        `rounded ${isActive ? "bg-muted" : ""} inline-block py-2 px-4 hover:underline`
      }
    />
  );
};

export default Layout;
