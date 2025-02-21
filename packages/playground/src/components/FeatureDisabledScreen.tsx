import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function FeatureDisabledScreen(props: {
  error: Error;
  title: string;
  message: string;
}) {
  const { error: _error, message, title } = props;
  const navigate = useNavigate();

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
          <Button
            variant="outline"
            className="mt-4 hover:bg-muted/50"
            onClick={() => navigate({ to: "/" })}
          >
            <Icon icon="lucide:home" className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
