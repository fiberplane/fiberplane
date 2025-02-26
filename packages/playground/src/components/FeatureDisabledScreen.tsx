import { Icon } from "@iconify/react";
import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function FeatureDisabledScreen(props: {
  error: Error;
  title: string;
  message: string;
}) {
  const { error: _error, message, title } = props;
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <Icon
          icon="lucide:lock"
          width={48}
          height={48}
          className="text-muted-foreground"
        />
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-foreground/70 text-center max-w-md">{message}</p>
          {canGoBack ? (
            <Button
              variant="outline"
              className="mt-4 hover:bg-muted/50"
              onClick={() => router.history.back()}
            >
              <Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-4 hover:bg-muted/50"
              onClick={() => router.history.back()}
              asChild
            >
              <Link to="/">
                <Icon icon="lucide:home" className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
