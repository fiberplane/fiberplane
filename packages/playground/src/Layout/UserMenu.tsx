import { Button } from "@/components/ui/button";
import {
  FpDropdownMenu,
  FpDropdownMenuContent,
  FpDropdownMenuItem,
  FpDropdownMenuSeparator,
  FpDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";
import { getFpApiBasePath } from "@/lib/api/fetch";
import type { UserProfile } from "@/lib/auth";
import { useLoginHandler } from "@/lib/hooks/useLogin";
import { LogOut, UserCircle } from "lucide-react";
import { cn } from "../utils";

export function UserMenu() {
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
